> 这个错误我也犯过

```bash
#!/bin/sh

STRING=

if [ -z "$STRING" ]; then 
    echo "STRING is empty" 
fi

if [ -n "$STRING" ]; then 
    echo "STRING is not empty" 
fi
```

注意，一定要在变量上加上`""`，表示字符串，然后进行判断。`-z`表示空字符串，`-n`表示非空字符串。

如果忘记加上`""`，则遇到这个逻辑的时候会提示错误

```
line 71: [: too many arguments
```

如果字符串为空，在没有加`""`会导致误判断，导致`-z`和`-n`都成立：

```bash
#!/bin/sh

STRING=

if [ -z $STRING ]; then 
    echo "STRING is empty" 
fi

if [ -n $STRING ]; then 
    echo "STRING is not empty" 
fi 
```

执行是错误的结果：

```
STRING is empty 
STRING is not empty
```

# 参考

* [linux shell 中判断字符串为空的正确方法](https://www.cnblogs.com/cute/archive/2011/08/26/2154137.html)