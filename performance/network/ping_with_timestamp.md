简单的方法

```
ping host | perl -nle 'print scalar(localtime), " ", $_'
```

重定向到文件则使用标准的shell重定向和关闭输出缓存

```
ping host | perl -nle 'BEGIN {$|++} print scalar(localtime), " ", $_' > outputfile
```

如果需要时哟功能ISO8601格式的timestamp:

```
ping host | perl -nle 'use Time::Piece; BEGIN {$|++} print localtime->datetime, " ", $_' > outputfile
```

> 如果要加快ping测试，例如每秒10次，可以以root用户身份执行`-i 0.1`，表示间隔`0.1`秒执行一次ping

# 参考

* [How do I timestamp every ping result?](http://stackoverflow.com/questions/10679807/how-do-i-timestamp-every-ping-result)