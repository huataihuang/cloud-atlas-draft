# subprocess模块简介

> 对于系统管理员来说，可能Python最重要的模块就是`subprocess`了，这是一个可以创建进程运行另一个程序的Python包，可以实现复杂的管理脚本。

subprocess的目的就是启动一个新的进程并且与之通信。

subprocess模块中只定义了一个类: Popen。可以使用Popen来创建进程，并与进程进行复杂的交互。

* `subprocess`构造函数

```python
subprocess.Popen(args, bufsize=0, executable=None, stdin=None, stdout=None, stderr=None, preexec_fn=None, close_fds=False, shell=False, cwd=None, env=None, universal_newlines=False, startupinfo=None, creationflags=0)
```

参数`stdin`, `stdout`, `stderr`分别表示程序的标准输入、输出、错误句柄。他们可以是`PIPE`，文件描述符或文件对象，也可以设置为`None`，表示从父进程继承。

如果参数`shell`设为`true`，程序将通过`shell`来执行。

参数`env`是字典类型，用于指定子进程的环境变量。如果`env = None`，子进程的环境变量将从父进程中继承。

# subprocess.Popen的cmd传递

在我编程实践中，如果需要使用`Popen`的`args`传递命令，并且命令中有需要传递`''`单引号来扩起某个列表的话，传递时候不需要最外面的`''`

例如，我需要执行

```bash
qcloudcli eip DescribeEip --RegionId gz --eipIds '["eip-nbo3vnos"]'
```

当通过`subprocess.Popen`使用时实际传递是以下字符串

```bash
qcloudcli eip DescribeEip --RegionId gz --eipIds ["eip-nbo3vnos"]
```

案例如下：

```python
describe_ip_cmd = 'qcloudcli eip DescribeEip --RegionId gz --eipIds ["eip-nbo3vnos"]'
process = subprocess.Popen(describe_ip_cmd, env=env, shell=shell_value,
                               stdin=subprocess.PIPE, stdout=tf_out,
                               stderr=tf_err, cwd=cwd)
...                           
```

# 参考

* [Python中subprocess学习](http://blog.csdn.net/imzoer/article/details/8678029)