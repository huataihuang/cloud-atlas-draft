很多时候需要查询当前时间之前的时间到当前的数据，可以通过mysql的 `data_sub` 函数来设置一个间隔时间获得：

```mysql
select * from test_table where count_time > date_sub(now(), interval 1 minute) ;
```

以上查询就是 `test_table` 的 `count_time` 字段中，一分钟以内数据查询。

# 参考

* [How to select last 3 minutes' records from MySQL with PHP](https://stackoverflow.com/questions/7553346/how-to-select-last-3-minutes-records-from-mysql-with-php/7553354#comment43101603_7553354)