# 通用内核跟踪系统

主要的Linux通用内核跟踪系统有:

* ptrace - 可以针对进程来跟踪系统调用的进入和退出，以及信号发送（也用于debug一个进程）

> 参考`man ptrace`和`man strace`

* [Ftrace](http://www.elinux.org/Ftrace) - 跟踪内核功能，也可以用于debug或分析延迟及性能问题。Ftrace功能从内核2.6.27开始包含进内核主线

* [System Tap](http://www.elinux.org/System_Tap) - 是一个可伸缩可扩展的增加跟踪搜集和分析的系统，允许创建一个跟踪集（即`tapset`），利用[KProbes](http://www-users.cs.umn.edu/~boutcher/kprobes/)接口和可加载的内核模块来动态添加检查点和在运行内核上创建代码，这样在Linux系统中运行而无需修改或重新编译系统。

* [LTTng](http://lttng.org) - LTTng: (Linux Trace Toolkit Next Generation),它是用于跟踪 Linux 内核、应用程序以及库的系统软件包。LTTng 主要由内核模块和动态链接库(用于应用程序和动态链接库的跟踪)组成。它由一个会话守护进程控制,该守护进程接受来自命令行接口的命令。babeltrace 项目允许将追踪信息翻译成用户可读的日志,并提供一个读追踪库,即 libbabletrace。

# 参考

* [Kernel Trace Systems](http://www.elinux.org/Kernel_Trace_Systems)