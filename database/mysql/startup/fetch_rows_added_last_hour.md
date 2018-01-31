# 查询最近一小时内记录

经常要查询日志数据库中最近1小时加入的数据，结合`DATE_SUB()`和`NOW()`函数方法如下：

```sql
select count(*) as cnt
from  log
where date >= DATE_SUB(NOW(),INTERVAL 1 HOUR); 
```

# 查询最近30分钟记录

可以使用`(now() - interval 30 minute)`

```sql
select count(*) as cnt
from  log
where date >= (NOW() - INTERVAL 30 minute); 
```

使用`DATE_SUB()`函数也可以：

```sql
select count(*) as cnt
from  log
where date >= DATE_SUB(NOW(), INTERVAL 30 minute); 
```

# 参考

* [MySQL: Fetching rows added last hour](https://stackoverflow.com/questions/3681345/mysql-fetching-rows-added-last-hour)
* [Get data from last 30 minutes and get the latest rows](https://stackoverflow.com/questions/9454585/get-data-from-last-30-minutes-and-get-the-latest-rows)