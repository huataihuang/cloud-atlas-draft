[在CentOS7中部署HAProxy](deploy_haproxy_in_centos7)实践中介绍了如何安装HAProxy，本文则结合HAProxy和MySQL来实现一个简单的负载均衡机群。注意：

> MySQL必须是[Master-Master replication](https://www.digitalocean.com/community/articles/how-to-set-up-mysql-master-master-replication)，这样才能确保数据库都能够写入。或者数据库都是slave模式并且限制外表访问只能读不能写，以实现只读模式负载均衡。

# 准备MySQL数据库

> 首先创建两个用户用于HAProxy

* 第一个用户账号将用于HAProxy检查服务器状态

```sql
mysql -u root -p -e "grant usage on mysql.user to haproxy_check@'172.17.0.1' identified by 'password'; FLUSH PRIVILEGES;"
```

* 创建一个MySQL用户从HAproxy访问MySQL机群，具有root权限。默认的root权限是只本地登陆，这里通过授权远程root访问，并且使用独立的root授权

```sql
mysql -u root -p -e "GRANT ALL PRIVILEGES ON *.* TO 'haproxy_root'@'172.17.0.1' IDENTIFIED BY 'password' WITH GRANT OPTION; FLUSH PRIVILEGES"
```

> 这里请使用实际的账号密码
>
> 这里`172.17.0.1`是HAProxy服务所在的服务器IP地址

# 在HAproxy服务器上安装MySQL客户端

* HAProxy使用mysql客户端来侦测连接，所以需要安装客户端

```
sudo dnf install mariadb
```

> CentOS 7安装mariadb来替代mysql - 如果是CentOS 6及以下版本使用yum安装`mysql-client`软件包

* 在HAproxy服务器上测试连接MySQL数据库，正常情况应该输出mysql数据库信息

```
mysql -h 172.17.0.5 -u haproxy_root -p -e "SHOW DATABASES"
```

# 安装和配置HAProxy

* 安装HAProxy软件包

```
sudo dnf install haproxy
```

* 备份初始HAProxy配置文件

```
sudo mv /etc/haproxy/haproxy.cfg{,.original}
```

* 编辑新配置文件

```
sudo vi /etc/haproxy/haproxy.cfg
```

首先是全局和默认配置部分：

```
global
    log 127.0.0.1 local0 notice
    user haproxy
    group haproxy

defaults
    log global
    retries 2
    timeout connect 3000
    timeout server 5000
    timeout client 5000
```

> 这里设置`log 127.0.0.1 local0 notice`表示HAProxy将日志发送127.0.0.1本地的rsyslog

然后是主要配置部分：

```
listen mysql-cluster
    bind 0.0.0.0:3306
    mode tcp
    option mysql-check user haproxy_check
    balance roundrobin
    server mysql-1 172.17.0.5:3306 check
    server mysql-2 172.17.0.6:3306 check
```

这个配置使得HAproxy监听在所有接口的3306端口上提供对外服务。此外，配置了服务器列表，通过`balance roundrobin`负载均衡方式转发到后端的2台MySQL服务器

> 注意：和HTTP负载均衡不同，HAProxy没有特定的MySQL模式，所以使用`tcp`

> HAProxy支持多种检测，默认是TCP检测，但是，这个检测方式对于数据库是不充分的。HAProxy使用MySQL Handshake Initialisation数据包和错误包来判断MySQL会话是否正常，所以对于数据库只需要设置`Host`表授权就可以了，不需要密码。

```
USE mysql;
INSERT INTO user (Host,User) values ('<ip_of_haproxy>','<username>');
FLUSH PRIVILEGES;
```

最后配置负载均衡的状态信息输出，也就是在HAProxy服务器上，提供一个对外`8080`端口访问提供统计页面 http://<Public IP of Load Balancer>:8080/ ：

```
listen status
    bind 0.0.0.0:8080
    mode http
    stats enable
    stats uri /
    stats realm Strictly\ Private
    stats auth A_Username:YourPassword
    stats auth Another_User:passwd
```

* 启动haproxy

```
sudo systemctl start haproxy
```

* 设置HAProxy负载均衡host主机的防火墙

> 注意CentOS 7默认开启了firewall防火墙，需要允许访问端口设置：

先检查有那些dmz区

```
$ firewall-cmd --get-active-zones
FedoraServer
  interfaces: wlp3s0
```

然后针对dmz区对外开放访问

```
sudo firewall-cmd --zone=FedoraServer --add-port=3306/tcp --permanent
sudo firewall-cmd --zone=FedoraServer --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

## 问题排查

在HAProxy服务器上无法查询数据库表（虽然前面直接连接服务器可以访问到3306端口远程查询）

```
$ mysql -h 127.0.0.1 -u haproxy_root -p -e "SHOW DATABASES"
Enter password: 
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0 "Internal error/check (Not system error)"
```

此外，`telnet <HAProxy>:3306` 显示网络连接立即被断开：`Connection closed by foreign host.`

> 补充说明：这个测试环境是在Docker中部署，mysql/mariadb服务器是在Docker容器中运行，而HAProxy是在host主机上运行。

检查Docker容器中运行的mysql/mariadb服务日志，发现是因为HAProxy是通过`172.17.0.1`的客户端来访问但是不使用密码（晕倒），所以导致了服务器拒绝了连接：

```
2017-11-07T09:44:39.636704Z 3004 [Note] Access denied for user 'haproxy_check'@'172.17.0.1' (using password: NO)
2017-11-07T09:44:41.638068Z 3005 [Note] Access denied for user 'haproxy_check'@'172.17.0.1' (using password: NO)
```

当前MySQL创建账号时候设置了密码，所以导致无法访问。临时的解决方法是，去除掉`haproxy_check`从特定IP访问的时候的密码限制，但是这不是一个解决方法。（真正的解决是要改正HAProxy的mysql检测脚本，添加上数据库访问账号。待以后探索）

* 临时取消密码访问

```
uninstall plugin validate_password;
SET PASSWORD FOR 'haproxy_check'@'172.17.0.1' = PASSWORD('');
```

> **`警告`**：这是一个非常严重的安全隐患，仅在可靠的安全措施下才可以在测试环境使用，务必尽快恢复原有安全设置。

> 以上配置修订之后，MySQL服务器上不再出现'haproxy_check'@'172.17.0.1'连接报错，此时从 http://<HAProxy>:8080 访问，可以看到后端`mysql-1`服务器状态恢复正常，并且也可以在自己的开发桌面电脑上远程mysql访问Docker容器中运行的MySQL数据库。

# 参考

* [How To Use HAProxy to Set Up MySQL Load Balancing](https://www.digitalocean.com/community/tutorials/how-to-use-haproxy-to-set-up-mysql-load-balancing--3) 较为简化的文档
* [MySQL Load Balancing with HAProxy - Tutorial](https://severalnines.com/resources/tutorials/mysql-load-balancing-haproxy-tutorial) - 这篇文档非常详细