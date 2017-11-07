虽然不是经常遇到，但是遇到了却比较麻烦的事情：MySQL root用户密码遗忘。

> 初始安装的MySQL数据库时没有root密码的，需要手工设置。但是如果设置了root密码却忘记了，就需要设置一个新密码。

# 在Unix/Unix-Like（Linux）平台重置MySQL数据库root密码

以下步骤是重置MySQL `'root'@'localhost'` 密码的方法，其他服务器登陆，则需要重置对应主机名对应账号密码，例如 `example.com` 主机访问MySQL的账号就是 `'root'@'example.com'`。

* 登陆运行MySQL数据库的系统
* 停止MySQL服务 - 根据发行版不同，MySQL服务进程的pid位置不同，可以通过`kill`命令（但是不要使用`kill -9`）来关闭`mysqld`进程。注意，以下命令行`.pid`文件替换成实际路径

```
kill `cat /var/lib/mysql/host_name.pid`
```
> 这里案例是Fedora/CentOS发行版的mysql路径
>
> 也可以通过系统`/etc/init.d/mysqld`来停止 `sudo /etc/init.d/mysqld stop`

* 使用`--skip-grant-tables`参数启动MySQL服务，这样任何人就可以无需密码访问所有权限。**警告**，由于这是一个不安全的设置，所以最好结合`--skip-grant-tables`和`--skip-networking`参数同时使用，避免恢复密码的时候有外部远程客户端连接：

```
/usr/sbin/mysqld --skip-grant-tables --skip-networking
```

* 在另外一个本地终端上输入`mysql`命令，此时无需密码连接到数据库执行密码重置

首先在mysql客户端，告诉服务器重新加载授权表，这样就可以进行账号管理：

```mysql
mysql> flush privileges;
```

MySQL 5.7.6及以后版本

```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyNewPass';
```

MySQL 5.7.5及以前版本

```
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('MyNewPass');
```

* 完成账号密码重置之后，就可以停止MySQL服务，然后再次正常启动MySQL服务（不要使用`--skip-grant-tables`和`--skip-networking`参数）:

```
mysql> flush privileges;
mysql> shutdown;
```

> 建议使用命令`shutdown`来关闭数据库，强制杀掉数据库进程可能有数据不完整

# 参考

* [MySQL 5.7 Reference Manual: How to Reset the Root Password](https://dev.mysql.com/doc/refman/5.7/en/resetting-permissions.html)