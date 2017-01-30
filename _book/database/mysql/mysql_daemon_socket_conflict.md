服务器宕机以后，重启服务器，报错如下

```
Stopping mysql55-mysqld:                                   [FAILED]
Another MySQL daemon already running with the same unix socket.
Starting mysql55-mysqld:                                   [FAILED]
[root@tfs-1-1 tfs]# /etc/init.d/mysql55-mysqld stop
Stopping mysql55-mysqld:                                   [FAILED]
```

检查mysql日志 `/var/log/mysql55-mysqld.log`，发现并没有新内容

参考 [centos: Another MySQL daemon already running with the same unix socket](http://stackoverflow.com/questions/20407292/centos-another-mysql-daemon-already-running-with-the-same-unix-socket)

首先优雅关闭服务器

```
shutdown -h now
```

启动服务器后，移除socket文件

```
mv /var/lib/mysql/mysql.sock /var/lib/mysql/mysql.sock.bak
service mysqld start
```

此时启动mysql服务会重建一个sock文件

