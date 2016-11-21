# 累加某列

```
ls -l php* | awk '{ SUM += $5} END { print SUM/1024/1024 }'
```

> 参考 [Sum using awk](http://www.liamdelahunty.com/tips/linux_ls_awk_totals.php)