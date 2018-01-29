经常要查询日志数据库中最近1小时加入的数据，结合`DATE_SUB()`和`NOW()`函数方法如下：

```sql
select count(*) as cnt
from  log
where date >= DATE_SUB(NOW(),INTERVAL 1 HOUR); 
```

# 参考

* [MySQL: Fetching rows added last hour](https://stackoverflow.com/questions/3681345/mysql-fetching-rows-added-last-hour)