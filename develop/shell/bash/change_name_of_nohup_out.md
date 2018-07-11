当在一个目录下同时使用`nohup`命令执行多个脚本时，如果各自命令都输出到默认的`nohup.out`文件中，会导致无法检查记录。

解决方法是让每个`nohup`输出到各自的日志文件：

```bash
nohup some_command & > nohup2.out &
```

对于bash 4之前的旧版本，可以使用如下方法：

```bash
nohup some_command > nohup2.out 2>&1 &
```

# 不产生nohup.out日志

将日志重定向到 /dev/null 可以不生成日志

```
nohup command >/dev/null 2>&1   # doesn't create nohup.out
```

```
nohup command >/dev/null 2>&1 & # runs in background, still doesn't create nohup.out
```

# 参考

* [Can I change the name of `nohup.out`?](https://stackoverflow.com/questions/4549489/can-i-change-the-name-of-nohup-out)
* [How do I use the nohup command without getting nohup.out?](https://stackoverflow.com/questions/10408816/how-do-i-use-the-nohup-command-without-getting-nohup-out)