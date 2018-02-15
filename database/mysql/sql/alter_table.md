MySQL的`ALTER`命令用来修改数据库和表字段，可以用来添加或删除字段。

# 字段

```sql
ALTER TABLE test_ex DROP COLUMN col_1;
```

> 删除表`test_ex`中的`col_1`字段

添加字段：

```sql
ALTER TABLE test_ex ADD new_col INT;
```

> 注意：如果增加字段或者修改字段，是需要直接提供字段类型的，否则会提示语法错误。

```sql
ALTER TABLE test_ex MODIFY new_col CHAR(10);
```

也可以使用`CHANGE`关键字来重新命名字段名字，注意，这个`CHANGE`也是需要提供类型的

```sql
ALTER TABLE test_ex CHANGE new_col new_col_again VARCHAR(20);
```

设置字段默认值

```sql
ALTER TABLE test_ex ALTER new_col_again SET DEFAULT 'I'm here';
```

# 表

可以修改表的存储引擎

```sql
ALTER TABLE test_ex TYPE = MYISAM;

SHOW TABLE STATUS LIKE 'test_ex'\G
```

修改表明

```sql
ALTER TABLE test_ex RENAME TO my_test_ex;
```


# 参考

* [MySQL - ALTER Command](https://www.tutorialspoint.com/mysql/mysql-alter-command.htm)