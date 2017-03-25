python程序通过subprocess启动外部程序运行，如果外部程序可以异步执行，可以通过`nohup`方式放到后台执行，避免python程序结束时候，外部程序也被同时kill。

这里需要注意的是，`nohup`只是在主进程正常退出情况下禁止`SIGHUP`信号，如果信号是`SIGINT`或`SIGTERM`则子进程也会收到相同信号，这是因为子进程和父进程属于相同的进程组。

要实现父进程退出时子进程不继续执行，有两种方式使用Popen的`preexec_fn`参数：

* 设置子进程组

```
subprocess.Popen(['nohup', 'my_command'],
                 stdout=open('/dev/null', 'w'),
                 stderr=open('logfile.log', 'a'),
                 preexec_fn=os.setpgrp
                 )
```

* 设置subprocess忽略这些信号：

```
def preexec_function():
    signal.signal(signal.SIGINT, signal.SIG_IGN)
subprocess.Popen( ... , preexec_fn=preexec_function)
```

```
Popen([path] + sys.argv[1:], 
          stdout=DEVNULL, stderr=STDOUT, preexec_fn=ignore_sighup)
```

# `nohup ... No such file or directory`问题（如果使用参数，需要使用shell）

```
        cmd = "sh myscript.sh option1"
        p = subprocess.Popen(['nohup', cmd], stdout=open('/dev/null', 'w'),
        stderr=open('myscript.log', 'a'),
        preexec_fn=os.setpgrp )
```

遇到执行的nohup脚本需要传递参数，但是有如下报错

```
nohup: cannot run command `sh myscript.sh option1': No such file or directory
```

参考 [OSError: [Errno 2] No such file or directory while using python subprocess in Django](http://stackoverflow.com/questions/18962785/oserror-errno-2-no-such-file-or-directory-while-using-python-subprocess-in-dj)

对于需要传递参数给脚本的方式，需要设置`shell=True`

> If passing a single string, either shell must be True or else the string must simply name the program to be executed without specifying any arguments.

```
subprocess.call(crop, shell=True)
```

或者:

```
import shlex
subprocess.call(shlex.split(crop))
```

修改脚本

```
        cmd = "sh myscript.sh option1"
        p = subprocess.Popen(['nohup', cmd], shell=True, stdout=open('/dev/null', 'w'),
        stderr=open('myscript.log', 'a'),
        preexec_fn=os.setpgrp )
```

但是遇到报错

```
nohup: missing operand
Try `nohup --help' for more information.
```

# 参考

* [Run a program from python, and have it continue to run after the script is killed](http://stackoverflow.com/questions/6011235/run-a-program-from-python-and-have-it-continue-to-run-after-the-script-is-kille)
* [subprocess gets killed even with nohup](http://stackoverflow.com/questions/37118991/subprocess-gets-killed-even-with-nohup)