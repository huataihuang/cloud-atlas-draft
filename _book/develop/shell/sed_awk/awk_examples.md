# 累加某列

```
ls -l php* | awk '{ SUM += $5} END { print SUM/1024/1024 }'
```

> 参考 [Sum using awk](http://www.liamdelahunty.com/tips/linux_ls_awk_totals.php)

# 字符串大小写转换

* 字符转为大写

```
cat file.txt | awk '{print toupper($0)}'
```

* 字符转为小写

```
cat file.txt | awk '{print tolower($0)}'
```