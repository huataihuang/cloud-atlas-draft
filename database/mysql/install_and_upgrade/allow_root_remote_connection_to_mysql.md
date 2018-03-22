测试环境（对安全性要求较低）需要设置允许ROOT用户远程访问数据库，方便使用图形管理工具。

> 默认MySQL禁止`root`远程访问

使用以下SQL设置允许：

```sql
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'password' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

并且在配置`my.cnf`文件中设置

```ini
bind-address = 127.0.0.1
```

注释掉这行：

```ini
#bind-address = 127.0.0.1
```

> 如果`my.cnf`中有限制IP绑定的设置，修改后需要重启MySQL服务

# 参考

* [How to allow remote connection to mysql](https://stackoverflow.com/questions/14779104/how-to-allow-remote-connection-to-mysql)