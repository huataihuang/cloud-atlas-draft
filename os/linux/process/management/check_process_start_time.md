要想知道进程启动时间，通常可以使用`ps`命令

```
ps -o lstart= -p the-pid
```

例如进程 `example_daemon` 的 `pid` 是 `1458`

```
$ ps aux | grep example_daemon
root      1458  1.2  0.0  59604  3772 ?        SLl  23:25   0:20 /usr/lib/example_daemon
```

则检查如下

```
ps -o lstart= -p 1458
```

显示输出详细的启动时间

```
Mon Mar  6 23:25:32 2017
```

但是上述时间是进程启动时间，不一定是命令当前执行调用的时间。进程可以（并且通常是）在它的生命周期内运行多个命令。并且命令有时候会唤起其他进程。

在`/proc`目录下的文件的`mtime`就是表示这些文件被实例化的时间，也就是进程访问它们活着列出目录中内容的第一次时间。

对于实例：

```
sh -c 'date +%T.%N; sleep 3; echo /proc/"$$"/xx*; sleep 3; stat -c %y "/proc/$$/cmdline"'
```

这里`/proc/"$$"/xx*`并不是实际存在的文件，而是为了使得shell去展开通配符，这样就会去读取`/proc/$$`目录下的内容，也就会导致`cmdline`文件被实例化。所以能够获得时间变化。

# 参考

* [When was a process started](http://unix.stackexchange.com/questions/62154/when-was-a-process-started)