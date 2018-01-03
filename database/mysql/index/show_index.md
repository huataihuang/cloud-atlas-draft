* 查看指定表格的索引使用`show index`命令：

```sql
show index from yourtable;
```

* 要查看特定schema的所有表格的索引，从`INFORMATION_SCHEMA`查询`STATISTICS`表：

```sql
SELECT DISTINCT
    TABLE_NAME,
    INDEX_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'your_schema';
```

# 参考

* [How to see indexes for a database or table?](https://stackoverflow.com/questions/5213339/how-to-see-indexes-for-a-database-or-table)