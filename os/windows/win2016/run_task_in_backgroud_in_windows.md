作为Linux系统管理员，[在Windows上安装OpenSSH](windows_openssh_server)后，通过ssh登陆到windows服务器上，就可以开始编写一些简单的脚本来完成管理任务了。

但是，和Linux不同，windows的终端概念中，是否有类似`nohup`一样的将脚本放到后台运行不会中断的方法呢？

Windows提供了一个`start`命令，可以在当前CLI会话之外运行另外一个命令，这样启动的进程就不会附加在当前你启动的窗口上，这样就做到了类似Linux的`nohup`方式：

```
start XXXX
```

# 参考

* [What's the nohup on Windows?](https://stackoverflow.com/questions/3382082/whats-the-nohup-on-windows)
* [How to run a task in background in windows](https://superuser.com/questions/1021953/how-to-run-a-task-in-background-in-windows)