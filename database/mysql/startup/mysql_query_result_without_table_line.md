mysql查询命令通常输出是带表格线的，类似如下

```
mysql> select code, created_at from my_records;
+------------+---------------------+
|     code   |          created_at |
+------------+---------------------+
| 1213307927 | 2013-04-26 09:52:10 |
| 8400000000 | 2013-04-29 23:38:48 |
| 8311000001 | 2013-04-29 23:38:48 |
+------------+---------------------+
3 rows in set (0.00 sec)
```

# 脚本执行mysql

在脚本中执行的方法是使用`-e`参数

```
mysql -e "select code, created_at from my_records;"
```

## 输出结果去除表格线

在脚本输出mysql查询结果的时候，通常不希望带表格线。这种方式称为raw格式，方法是在执行语句最后加上`\G`

```
mysql -e "select code, created_at from my_records\G"
```

此时输出类似如下

```
*************************** 1. row ***************************
 code: 1213307927
 created_at: 2013-04-26 09:52:10
*************************** 2. row ***************************
 code: 8400000000  
 created_at: 2013-04-29 23:38:48
```

## 输出到文件中带表格线

如果通过脚本方式执行`mysql -e "XXXXX"`重定向到文本文件，会发现所有的表格线都被去除了，这样方便进行进一步脚本处理。

但是，有时候却希望输出文本是完全具备mysql交互查询所携带的表格线（例如，直接复制粘贴结果，不做进一步处理，则mysql表格线非常清晰）。此时可以使用`--table`参数：

```sql
mysql --table -e "select code, created_at from my_records;" > my_records.txt
```

此时在`my_records`会有非常整齐的文本格式。

> 参考 [Table Format](https://dev.mysql.com/doc/refman/5.7/en/mysql-shell-output-table-format.html)

# 参考

* [Display query results without table line within mysql shell ( nontabular output )](http://stackoverflow.com/questions/18630499/display-query-results-without-table-line-within-mysql-shell-nontabular-output)