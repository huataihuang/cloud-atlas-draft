在命令行和脚本中，我们都需要通过账号密码才能访问数据库。但是，显然将密码存放在脚本中是不安全的。

mysql支持直接读取指定配置文件来访问数据库，你可以在特定配置文件中包含访问数据库的账号密码，在命令行和脚本中使用参数 `--defaults-file` 使用这个配置，就不需要输入账号密码了：

```bash
#!/bin/bash
export LANG=en_US.UTF-8
# 随机插入数据，验证功能

waf_count=`echo $(($RANDOM % 10))`

mysql --defaults-file=/etc/onesredb.cnf onesredb <<MYSQL_INPUT
insert into api_hygonwafmonitor() values($waf_count,CURTIME());
MYSQL_INPUT
```

# 参考

* [Give .my.cnf to mysql command line](https://stackoverflow.com/questions/12512814/give-my-cnf-to-mysql-command-line)