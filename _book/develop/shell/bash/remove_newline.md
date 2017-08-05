经常需要ssh到服务器上执行一系列命令，但是每个命令输出以后会换行，对于一些搜集信息，想实现每个主机返回收据都在一行，以便后期过滤处理很不方便。

解决思路主要有：

* `echo`命令使用`-n`参数，则可以不换行
* `echo -n $(执行的命令)`则通过`echo -n`方式打印结果就不会换行
* 通过`tr`命令去除`\n`和`\r`

```
tr -d "\n\r" < yourfile.txt
```

> unix环境`\n`，window环境`\r`

# 参考

* [Why does bash remove \n in $(cat file)?](https://askubuntu.com/questions/121866/why-does-bash-remove-n-in-cat-file)