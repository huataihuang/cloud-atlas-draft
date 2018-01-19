在bash内置命令中有一个`exec`指令，在shell脚本中，可以使用类似：

```bash
#!/bin/sh
exec /bin/valgrind --leak-check=full --log-file=/var/log/myapp.log /usr/bin/myapp
```

那么，`exec`和直接执行程序有什么区别？

参考`man bash`可以看到：`exec [-cl] [-a name] [command [arguments]]`

如果`exec`运行`command`，则它会代替shell，这样就不会创建新的进程。`arguments`就是`command`的`arguments`。如果`-l`参数使用，shell将在传递给命令的第0个参数的开头放置一个破折号，这是login所完成的。使用`-c`参数则使得命令运行在空白环境。如果使用`-a`参数，shell将`name`作为第0个参数传递个执行命令。如果命令由于某些原因不能执行，一个非交互的shell退出，除非激活了`execfail`的shell参数。此时，将返回failure。交互shell在文件不能执行时返回failure。

如果命令没有指定，所有重定向将作用到当前shell，并且返回状态是0.如果重定向错误，返回状态是1。

通常，运行`command > file`，则这条`command`命令的输出会写入到`file`文件而不是终端（也就是所谓的重定向`redirection`）。那么，如果使用`exec > file`命令，就会重定向整个shell的输出，即将当前shell的所有输出都写入到文件而不是终端。举例如下：

```bash
bash-3.2$ bash
bash-3.2$ exec > file
bash-3.2$ date
bash-3.2$ exit
bash-3.2$ cat file
Thu 18 Sep 2014 23:56:25 CEST
```

这种方式在shell脚本中比较有用。

# 参考

* [What does an “exec” command do?](https://askubuntu.com/questions/525767/what-does-an-exec-command-do)