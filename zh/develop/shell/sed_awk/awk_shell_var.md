```bash
down=50
up=$down+20
cat $i.log | awk 'BEGIN {count = 0} {if ($1 >= $down && $1 < $up) count = count + 1 fi} END {print $down","$up","count}' >> ${i}_result.csv
```

结果发现打印出来`$down`和`$up`实际是空的，实际上就是shell中的变量`$down`和`$up`并没有传递给awk。

参考了[shell & awk 变量传递](http://jimobit.blog.163.com/blog/static/283257782009101735619534/)，使用了比较土的方法

> `export变量，然后用 ENVIRON["var"]`

```
		((down=50+$j*20))
		export down
		((up=$down+20))
		export up
		cat $i.log | awk 'BEGIN {count = 0} {if ($1 >= ENVIRON["down"] && $1 < ENVIRON["up"]) count = count + 1 fi} END {print count}' >> ${i}_result.csv
```


