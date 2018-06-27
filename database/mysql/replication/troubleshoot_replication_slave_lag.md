# 主从同步备库延迟（slave lags）

当使用MySQL replication复制，最初看上去主从同步完全正常，主服务器的变化很快反映到从服务器。但是，偶然也会出现一些延迟，甚至严重时，从服务器迟迟没有得到更新。

## 常见的备库延迟原因

* CPU负载：集群过于繁忙无法即使处理复制事件
* 丢失索引：更新的数据库表没有主键或者如果是SBR，没有正确的索引
* 锁等待超时：在slave主机上，由于没有commit的会话会导致锁等待超时
* 常规卷写入：当站点流量或大量的删除或更新导致站点流量增长，也使得写入卷增长
* 数据一致性：通常slave的停止和启动会导致数据一致性问题（重复的键或者数据记录行丢失）
* 长时间运行聚合查询（基于SQL语句复制的SBR环境）：在SBR中聚合查询将占用很长的时间来处理结果，则导致后台日志查询等待
* 数据分布：目标表没有分布在所有节点
* 网络问题

> mysql的RBR和SBR:
> 
> 从MySQL 5.1开始，支持基于行的复制，即关注表中发生变化的记录，而不是以前直接复制binlog。从 MySQL 5.1.2 开始可以使用三种模式实现复制：
> * 基于SQL语句的复制(statement-based replication, SBR)
> * 基于行的复制(row-based replication, RBR)
> * 混合模式复制(mixed-based replication, MBR)
> 相应地，binlog的格式也有三种：STATEMENT，ROW，MIXED。

在slave上处理写日志可能比master慢，是因为在master主机上复制是单线程，而写查询可以并发处理。对于负载非常重的环境，使用多个binlog可能可以优化复制。

# 如何定位复制延迟

MySQL复制使用了2个线程：`IO_THREAD`和`SQL_THREAD`：

* `IO_THREAD`连接到master数据库，从master读取binlog事件，并将binlog复制成一个本地的名为`relay log`的log文件。
* `SQL_THREAD`则在slave数据库上读取复制后的本地日志（这个日志文件是由`IO_THREAD`写入的），然后尽可能快地应用这个SQL。

当出现复制延迟，最重要的第一步就是检查slave主机上的`IO_THREAD`或`SQL_THREAD`。

通常，I/O线程不会导致很大的延迟，因为这线程只是从master上读取binlog。然而，网络连接和网络延迟会影响I/O线程的稳定工作。当网络带宽阻塞时，slave主机上的I/O线程会变慢。通常，当slave主机上的`IO_THERAD`能够足够快速读取binlog并在slave主机上构建`relay log`，就可以确定`IO_THREAD`不是导致复制延迟的原因。

另一方面，当slave主机上`SQL_THREAD`导致复制延迟有可能是slave主机上复制流花费了太长时间来执行。有时候这是因为主从服务器使用了不同的硬件，不同的schema索引，不同的负载。进一步，slave OLTP工作负载有可能导致复制延迟。

例如，一个长时间运行的读会阻塞MyISAM表的SQL线程，或者任何InnoDB表的回话引发的IX锁或者SQL线程的阻塞DDL。

# 检查

* 在master主机上检查

```
mysql> show master status;
+------------------+-----------+--------------+-------------------+-------------------+
| File             | Position  | Binlog_Do_DB | Binlog_Ignore_DB  | Executed_Gtid_Set |
+------------------+-----------+--------------+-------------------+-------------------+
| mysql-bin.000002 | 157689756 | perfree      | PerfreeTest,mysql |                   |
+------------------+-----------+--------------+-------------------+-------------------+
1 row in set (0.00 sec)
```

* 在slave主机上检查

```
mysql> show slave status\G;
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 47.89.245.126
                  Master_User: perfree
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000002
          Read_Master_Log_Pos: 157687292
               Relay_Log_File: mysqld-relay-bin.001258
                Relay_Log_Pos: 366507
        Relay_Master_Log_File: mysql-bin.000002
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: perfree
          Replicate_Ignore_DB:
           Replicate_Do_Table:
       Replicate_Ignore_Table:
      Replicate_Wild_Do_Table:
  Replicate_Wild_Ignore_Table:
                   Last_Errno: 0
                   Last_Error:
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 157687292
              Relay_Log_Space: 366844
              Until_Condition: None
               Until_Log_File:
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File:
           Master_SSL_CA_Path:
              Master_SSL_Cert:
            Master_SSL_Cipher:
               Master_SSL_Key:
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error:
               Last_SQL_Errno: 0
               Last_SQL_Error:
  Replicate_Ignore_Server_Ids:
             Master_Server_Id: 1
                  Master_UUID: 58283a0c-8ad8-11e7-a193-00163e007b7e
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for the slave I/O thread to update it
           Master_Retry_Count: 86400
                  Master_Bind:
      Last_IO_Error_Timestamp:
     Last_SQL_Error_Timestamp:
               Master_SSL_Crl:
           Master_SSL_Crlpath:
           Retrieved_Gtid_Set:
            Executed_Gtid_Set:
                Auto_Position: 0
1 row in set (0.00 sec)

ERROR:
No query specified
```

这里可以看到，Master上的binlog文件是 `mysql-bin.000002` ，同样在Slave上检查可以看到 `Master_Log_File: mysql-bin.000002`，这说明主备之间binlog文件是同步的（如果落后，slave文件编号会比master小，就说明有部分binlog没有传输过来）。但是，即使`binlog`文件名同步了，`Position`不一致的话，依然说明slave落后于master。

注意，在slave上：

```
Read_Master_Log_Pos: 157687292
...
Exec_Master_Log_Pos: 157687292
```

由于slave上Read的日志文件位置和Exec的日志文件位置完全一致(当前都是`157687292`)，则说明slave上回放sql是完全及时的，只是slave上位置比master上的位置`157689756`要小，就说明master和slave之间的网络连接和传输不佳。

等待一段时间，则当slave上的Pos追上master的Position，数据就同步了。

另外，对于网络连接不佳，可以参考 [MySQL主从延迟原因以及解决方案](http://blog.51cto.com/lyanhong/1914288) 适当调整参数：

```
–slave-net-timeout=seconds  #默认3600秒
–master-connect-retry=seconds   #默认60秒
```

# 参考

* [How to identify and cure MySQL replication slave lag](https://www.percona.com/blog/2014/05/02/how-to-identify-and-cure-mysql-replication-slave-lag/)
* [How to Troubleshoot Replication Slave Lag](https://support.clustrix.com/hc/en-us/articles/203655839-How-to-Troubleshoot-Replication-Slave-Lag)
* [mysql的RBR和SBR的优缺点](http://blog.51cto.com/tech110/965486)