> 这里在安装完MySQL数据库软件并启动服务后，快速创建一个MySQL数据库并授权账号访问，以便后续开发。

* 在mysql中创建数据库 `appdb`

```
create database appdb character set utf8;

create user app@'%' identified by 'MyPass';

grant all privileges on appdb.* to app@'%';

flush privileges;
```

> 我发现有的版本mariadb(5.5.68)，如果只设置允许 `%` 主机访问，并没有包含 `localhost` ，所以可能需要补充命令

```sql
grant all privileges on appdb.* to app@'localhost';
update user set Password=password('MyPass') where user='app';
flush privileges;
```

检查验证权限使用命令

```
mysql -u'app' -p'MyPass' appdb
```

> 参考 [How-To create a MySQL database and set privileges to a user](https://www.debuntu.org/how-to-create-a-mysql-database-and-set-privileges-to-a-user/)
>
> 注意：使用mysql命令验证连接时，用户密码`-p`后连接密码中间不要加空格。