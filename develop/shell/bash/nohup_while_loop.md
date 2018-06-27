在一次稳定性压测时，需要不断循环运行unixbench，简单的命令就是：

```bash
while true;do ./unixbench.sh;done
```

由于远程执行需要防止网络断开影响，所以想使用`nohup`放到后台执行，但是，直接使用

```bash
nohup while true;do ./unixbench.sh;done &
```

则会出现语法错误。

然而，我又不想为这么简单的一条命令编辑一个shell脚本。

解决的方法时使用`sh -c`：

```bash
nohup sh -c 'while true;do ./unixbench.sh;done' &
```

原因是`nohup`希望后面跟随的是一条语句命令，而不是loop循环结构，所以需要使用`sh -c`

# 参考

* [Why can't I use Unix Nohup with Bash For-loop?](https://stackoverflow.com/questions/3099092/why-cant-i-use-unix-nohup-with-bash-for-loop)