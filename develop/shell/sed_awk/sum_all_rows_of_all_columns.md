最近的一个计算案例，类似如下

```
1 4 7 ...
2 5 8
3 6 9 
```

需要计算出每一列的累加值

```
6 15 24 ...
```

巧妙的方法:

```bash
awk '{for(i=1;i<=NF;i++)$i=(a[i]+=$i)}END{print}' file
```

解释:

- `{for (i=1;i<=NF;i++)` 表示数值字段从1 到 最后一列
- `$i=(a[i]+=$i)` 表示将每列叠加
- `END{print}` 最后打印

# 参考

* [Sum of all rows of all columns - Bash](https://stackoverflow.com/questions/27104990/sum-of-all-rows-of-all-columns-bash)