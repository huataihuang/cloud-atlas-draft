`mysqldump`是一个简单而有效的MySQL数据库备份恢复工具。它使用`DROP table`，`CREATE table`和`insert into`的方式，使用`*.sql`文件来备份和恢复数据库。

简单的方法就是：

```
backup: # mysqldump -u root -p[root_password] [database_name] > dumpfilename.sql

restore:# mysql -u root -p[root_password] [database_name] < dumpfilename.sql
```

# 备份MySQL数据库

* 备份单一数据库：

```
 mysqldump -u root -ptmppassword sugarcrm > sugarcrm.sql

# mysqldump -u root -p[root_password] [database_name] > dumpfilename.sql
```

* 备份多个数据库

如果需要备份多个数据库，首先需要知道哪些数据库需要备份，可以通过`show databases`检查。

假设需要同时备份`sugarcrm`和`bugs`数据库

```
# mysqldump -u root -ptmppassword --databases bugs sugarcrm > bugs_sugarcrm.sql
```

* 备份所有数据库

```
# mysqldump -u root -ptmppassword --all-databases > /tmp/all-database.sql
```

* 只备份一个指定表格

举例：备份`sugarcrm`数据库的`accouts_contacts`表格

```
# mysqldump -u root -ptmppassword sugarcrm accounts_contacts \
      > /tmp/sugarcrm_accounts_contacts.sql
```

# 恢复MySQL数据库

* 恢复一个数据库

```bash
# mysql -u root -ptmppassword

mysql> create database sugarcrm;
Query OK, 1 row affected (0.02 sec)

# mysql -u root -ptmppassword sugarcrm < /tmp/sugarcrm.sql

# mysql -u root -p[root_password] [database_name] < dumpfilename.sql
```

* 备份一个本地数据库并恢复到远程服务器的单一命令：

```bash
[local-server]# mysqldump -u root -ptmppassword sugarcrm | mysql \
                 -u root -ptmppassword --host=remote-server -C sugarcrm1
```

> **注意**：在`host`之前是两个`-`号

# 参考

* [Backup and Restore MySQL Database Using mysqldump](https://www.thegeekstuff.com/2008/09/backup-and-restore-mysql-database-using-mysqldump/#more-184)