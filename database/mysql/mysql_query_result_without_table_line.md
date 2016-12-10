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

在脚本中执行的方法是使用`-e`参数

```
mysql -e "select code, created_at from my_records;"
```

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

# 参考

* [Display query results without table line within mysql shell ( nontabular output )](http://stackoverflow.com/questions/18630499/display-query-results-without-table-line-within-mysql-shell-nontabular-output)