> 排查Java应用中出现连接数据库异常，本文仅是一个排查思路参考，并非确定解决特定案例。

```
2018-03-08 11:08:52,188 [/// - ] ERROR template.ViewQueryTemplateImpl - [0aae311815204875290098096,0,,,]system exception-query template
org.springframework.jdbc.UncategorizedSQLException: SqlMapClient operation; uncategorized SQLException for SQL []; SQL state [null]; error code [0];
--- The error occurred in sqlmap/fccustview/manual/Profile-sqlmap-mapping.xml.
--- The error occurred while applying a parameter map.
--- Check the MS-PROFILE-FIND-BY-TARGET-InlineParameterMap.
--- Check the statement (query failed).
--- Cause: com.alibaba.druid.pool.GetConnectionTimeoutException: get connection from cluster:clusterId: 5 clusterIp: 100.105.43.30:2828, isMaster:true, percent:100, mergeservers: [100.105.43.127:2880, 100.105.43.71:2880], isActive:true, readStrategy: ROUNDROBIN_STRATEGY, hashcode: -2131293653 failed, retry times:0, maxWait:500; nested exception is com.ibatis.common.jdbc.exception.NestedSQLException:
--- The error occurred in sqlmap/fccustview/manual/Profile-sqlmap-mapping.xml.
--- The error occurred while applying a parameter map.
--- Check the MS-PROFILE-FIND-BY-TARGET-InlineParameterMap.
--- Check the statement (query failed).
--- Cause: com.alibaba.druid.pool.GetConnectionTimeoutException: get connection from cluster:clusterId: 5 clusterIp: 100.105.43.30:2828, isMaster:true, percent:100, mergeservers: [100.105.43.127:2880, 100.105.43.71:2880], isActive:true, readStrategy: ROUNDROBIN_STRATEGY, hashcode: -2131293653 failed, retry times:0, maxWait:500
        at org.springframework.jdbc.support.AbstractFallbackSQLExceptionTranslator.translate(AbstractFallbackSQLExceptionTranslator.java:83)
        at org.springframework.jdbc.support.AbstractFallbackSQLExceptionTranslator.translate(AbstractFallbackSQLExceptionTranslator.java:80)
        at org.springframework.jdbc.support.AbstractFallbackSQLExceptionTranslator.translate(AbstractFallbackSQLExceptionTranslator.java:80)
```

上述日志显示当时连接集群 100.105.43.30:2828 出现超时

mergeservers: [100.105.43.127:2880, 100.105.43.71:2880]

在armory中可以查到 100.105.43.30 服务器是 OceanBase105043030.cloud.in53 （物理服务器）


上述 Cause: com.alibaba.druid.pool.GetConnectionTimeoutException 表示druid连接出现问题。这个druid连接数据库在网上有些案例排查可以参考：

* [获取连接超时 #2130](https://github.com/alibaba/druid/issues/2130)

有可能是建立连接的超时时间设置太短，`maxWait:500` 也就时 0.5 秒。  `wendal commented on Nov 24, 2017` 建议修改成 `15000` ，因为建oracle连接的时候,有时候很慢。我们的服务器是OceanBase，可以理解成MySQL，是否也存在连接建立需要比较长的情况呢？

参考[The Tomcat JDBC Connection Pool](https://tomcat.apache.org/tomcat-7.0-doc/jdbc-pool.html#Common_Attributes) 中建议的`maxWait`是`30000` (30 秒)

> (int) The maximum number of milliseconds that the pool will wait (when there are no available connections) for a connection to be returned before throwing an exception. Default value is 30000 (30 seconds)

参考[配置_DruidDataSource参考配置](https://github.com/alibaba/druid/wiki/%E9%85%8D%E7%BD%AE_DruidDataSource%E5%8F%82%E8%80%83%E9%85%8D%E7%BD%AE)

```xml
  <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close"> 
      <!-- 基本属性 url、user、password -->
      <property name="url" value="${jdbc_url}" />
      <property name="username" value="${jdbc_user}" />
      <property name="password" value="${jdbc_password}" />
        
      <!-- 配置初始化大小、最小、最大 -->
      <property name="initialSize" value="1" />
      <property name="minIdle" value="1" /> 
      <property name="maxActive" value="20" />
   
      <!-- 配置获取连接等待超时的时间 -->
      <property name="maxWait" value="60000" />
   
      <!-- 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒 -->
      <property name="timeBetweenEvictionRunsMillis" value="60000" />
   
      <!-- 配置一个连接在池中最小生存的时间，单位是毫秒 -->
      <property name="minEvictableIdleTimeMillis" value="300000" />
    
      <property name="validationQuery" value="SELECT 'x'" />
      <property name="testWhileIdle" value="true" />
      <property name="testOnBorrow" value="false" />
      <property name="testOnReturn" value="false" />
   
      <!-- 打开PSCache，并且指定每个连接上PSCache的大小 -->
      <property name="poolPreparedStatements" value="true" />
      <property name="maxPoolPreparedStatementPerConnectionSize" value="20" />
   
      <!-- 配置监控统计拦截的filters -->
      <property name="filters" value="stat" /> 
  </bean>
```

按照Druid官方文档，这个`maxWait`默认值是`60000`，也就时`获取连接等待超时的时间`默认为`60秒`。官方文档建议：通常来说，**只需要修改`initialSize`、`minIdle`、`maxActive`。**

另外，在 [获取连接超时 #2130](https://github.com/alibaba/druid/issues/2130) 这个issue中提到，如果客户端出现 `Cause: com.alibaba.druid.pool.GetConnectionTimeoutException` 时，如果不是网络原因（假设客户端网络和服务器之间网络是正常的），则因为客户端断开`500ms`建立连接的超时，会从客户端断开连接。此时在服务器上日志可以看到类似：

```
2017-11-28T03:26:05.495523Z 20555 [Note] Aborted connection 20555 to db: 'xxxt' user: 'xxx' host: '192.168.92.53' (Got an error reading communication packets)
```

所以建议用户：

  * 当发生`com.alibaba.druid.pool.GetConnectionTimeoutException`时（这里设置的`maxWait:500`明显偏小），记录下时间点。将这个时间点提供给数据库管理员，检查数据库服务器日志。如果数据库服务器日志显示客户端已经连接（至少说明网络是通的，不过也存在网络质量因素），则请DBA观察数据库服务器提供连接建立的时间是否能够满足在`500ms`内完成。有可能数据库服务器比较繁忙，或者其他因素导致提供给客户端的完整连接建立时间需要一定的延迟。

* [druid连接池获取不到连接的一种情况](www.cnblogs.com/spec-dog/p/6226212.html)

一种案例是调用了`baseConn.close();`关闭连接，但是底层druid连接池却不知道，还认为自己拥有这个连接，但实际该连接是不可用的，这段代码执行多次，就将druid连接池中所有连接都耗光了，于是便抛出`Could not get JDBC Connection`错误。

```java
                finally {
                    stmt.close();
                    baseConn.close();   // 直接关闭连接，druid底层不知道连接断开
                    jobDataMap.remove(data_file_path_key);
                    FileUtils.deleteQuietly(dataFile);
                }
```

修改成

```java
                finally {
                    stmt.close();
                    conn.close();       // 只调用druid 连接的close方法（只是释放该连接，而不是直接关闭底层连接），问题解决。
                    jobDataMap.remove(data_file_path_key);
                    FileUtils.deleteQuietly(dataFile);
                }
```

> [使用druid连接池的超时回收机制排查连接泄露问题](blog.csdn.net/peterwanghao/article/details/40071857) 介绍了一种排查druid连接池泄露的方法，就是利用druid的`removeAbandoned`方法，设置3分钟关闭闲置连接。此时应用日志就会抛出异常，就可以知道是哪个应用存在连接池泄露问题（程序忘记关闭数据库连接）：

```xml
<!-- 超过时间限制是否回收 -->
<property name="removeAbandoned" value="true" />
<!-- 超时时间；单位为秒。180秒=3分钟 -->
<property name="removeAbandonedTimeout" value="180" />
<!-- 关闭abanded连接时输出错误日志 -->
<property name="logAbandoned" value="true" />  
```

> 上述方法也是druid官方FAQ提供的[连接泄漏监测](https://github.com/alibaba/druid/wiki/%E8%BF%9E%E6%8E%A5%E6%B3%84%E6%BC%8F%E7%9B%91%E6%B5%8B)方法。另外，druid提供了一个[WebStatFilter](https://github.com/alibaba/druid/wiki/%E9%85%8D%E7%BD%AE_%E9%85%8D%E7%BD%AEWebStatFilter)在内置监控页面`weburi-detail.html`中，查看`JdbcPoolConnectionOpenCount`和`JdbcPoolConnectionCloseCount`属性，如果不相等，就是泄漏了。