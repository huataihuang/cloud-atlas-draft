> MySQL支持查询日期格式类似shell的`date +%Y%m%d`这样的方法，所以就很容易对比时间：

```sql
SELECT users.id, DATE_FORMAT(users.signup_date, '%Y-%m-%d') 
FROM users 
WHERE DATE(signup_date) = CURDATE()
```

或者

```sql
SELECT users.id, DATE_FORMAT(users.signup_date, '%Y-%m-%d') 
FROM users 
WHERE DATE_FORMAT(users.signup_date, '%Y-%m-%d') = CURDATE()
```

# 参考

* [MySQL Select Date Equal to Today](https://stackoverflow.com/questions/12677707/mysql-select-date-equal-to-today)