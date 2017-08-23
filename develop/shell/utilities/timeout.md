在脚本中调用一些系统命令，有可能由于某些原因出现无响应情况。脚本该如何判断调用命令是否超时，并且在超时的时候终止掉调用并继续执行以避免hang住呢？

Linux的coreutils工具包提供了一个很好的命令 `timeout` ，可以提供一个简单测试执行命令是否正常返回控制并且提供了超时终止执行的功能。

以下先写一个简单地死循环脚本`test.sh`：

```bash
while [ 1 -gt 0 ];do
    echo test > /dev/null
done
```

然后使用以下命令设置10秒超时返回：

```
timeout 10s sh test.sh
```

可以看到10秒钟后死循环的脚本被终止。

如何判断是超时呢？

`timeout`对于超时强制结束的指令返回的返回码是`124`，可以通过输出`echo $?`来获取返回码：

```
$echo $?
124
```

这样脚本只需要判断返回码就知道是否出现了命令调用超时问题。

# 参考

* [Timeout function return value](https://unix.stackexchange.com/questions/205076/timeout-function-return-value)