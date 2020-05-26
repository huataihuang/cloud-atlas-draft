在维护集群时，常常需要在大量服务器上执行相同的命令，虽然可以自己写循环执行脚本，但是不仅麻烦而且执行效率不高。此时我们通常会使用pssh工具来并发执行SSH指令。

# 安装pssh

## Ubuntu安装pssh

在Ubuntu上， `pssh` 包安装之后，直接执行 `pssh` 命令会提示无法找到指令。实际上Ubuntu安装 `pssh` 软件包后实际的执行程序是采用了 `parallel-` 开头的命令，例如 `parallel-ssh` 和 `parallel-scp` 等。所以，为了方便使用，可以建立软链接:

```
cd /usr/bin
sudo ln -s parallel-ssh pssh
sudo ln -s parallel-scp pscp
sudo ln -s parallel-rsync prsync
sudo ln -s parallel-nuke pnuke
sudo ln -s parallel-slurp pslurp
```

> 以下在Ubuntu上实践都直接使用 `pssh` 和 `pscp` 等命令，如果你在Ubuntu上看不到这个指令（并且已经安装好 `pssh` 软件包)，可以尝试先通过软链接修正。

## 通过pip安装

pssh实际上是一个python程序，所以可以通过 Python pip方式安装

```
# 如果是RHEL/CentOS则使用以下yum安装命令
yum install python-pip
# 如果是Debian/Ubuntu则使用以下apt安装命令
apt install python-pip

# 通过pip安装pssh
pip install pssh
```

# 命令说明

| 命令 | 说明 |
| ---- | ---- |
| pssh | 并行在多个远程主机上执行ssh命令 |
| pscp | 并行从多个主机上复制文件 |
| prsync | 并行从多个主机使用rsync同步文件 |
| pnuke | 并行在多个主机上杀死进程 |
| pslurp | 并行在多个主机上复制文件到一个中心主机上 |

# 使用pssh指令

* 首先创建一个hosts文件，名字可以按需设置，例如，我要访问ceph集群，则创建 `ceph-hosts` 配置文件，内容如下

```
172.18.0.11
172.18.0.12
172.18.0.13
172.18.0.14
172.18.0.15
```

如果SSH端口不同，可以在主机ip后面加上端口号，例如 `172.18.0.11:2222` 表示该主机的SSH访问端口是 `2222`

* 常用参数

| 参数 | 说明 |
| ---- | ---- |
| -h | 主机名列表文件 |
| -l | 登陆用户名，例如 `-l root` |
| -A | 提供统一的登陆密码 |
| -i | 交互模式，远程服务器的命令执行结果会输出 |

举例：

```
pssh -ih ceph-hosts -l root -A "uptime"
```

# 忽略服务器密钥

在批量处理主机时，如果需要每个服务器都确认服务器密钥是不现实的，这里就需要使用ssh的一个参数 `-O StrictHostKeyChecking=no` ，这个参数也可以传递给pssh

```
pssh -O StrictHostKeyChecking=no -ih sigma-eu95_ip -l huatai -A "uptime"
```

# 终端tty

在pssh执行 `sudo` 命令时候，会出现报错：

```
...
[14] 14:45:00 [FAILURE] 192.168.1.11 Exited with error code 1
Stderr: sudo: no tty present and no askpass program specified
...
```

这个报错在ssh远程执行sudo命令时候也会遇到，原因是远程执行强制的基于screen的程序时，需要使用`-t`参数来分配一个tty，即使ssh没有本地tty。不过，我没有找到如何把这个参数传递给pssh的方法，所以遇到这个问题，我暂时使用循环方式使用ssh命令。举例：

```bash
for i in `cat host`;do ssh -t huatai@$i "echo PASSWORD | sudo -S cp /tmp/my_script.sh /usr/local/bin/my_script.sh";done
```

> 这里远程服务器sudo需要输入密码，采用了 [sudo工具](sudo) 中通过管道向sudo传输密码的方法，此时 sudo 需要使用参数 `-S` 从 `stdin` 获取密码。

# 并发

pssh和pscp支持并发，但是在macOS上并发执行，例如 `-p 100` 则出现报错

```
    do_pscp(hosts, localargs, remote, opts)
  File "/usr/local/Cellar/pssh/2.3.1/libexec/bin/pscp", line 80, in do_pscp
    statuses = manager.run()
  File "/usr/local/Cellar/pssh/2.3.1/lib/python2.7/site-packages/psshlib/manager.py", line 75, in run
    self.update_tasks(writer)
  File "/usr/local/Cellar/pssh/2.3.1/lib/python2.7/site-packages/psshlib/manager.py", line 133, in update_tasks
    self._start_tasks_once(writer)
  File "/usr/local/Cellar/pssh/2.3.1/lib/python2.7/site-packages/psshlib/manager.py", line 146, in _start_tasks_once
    task.start(self.taskcount, self.iomap, writer, self.askpass_socket)
  File "/usr/local/Cellar/pssh/2.3.1/lib/python2.7/site-packages/psshlib/task.py", line 99, in start
    close_fds=False, preexec_fn=os.setsid, env=environ)
  File "/usr/local/Cellar/python@2/2.7.16/Frameworks/Python.framework/Versions/2.7/lib/python2.7/subprocess.py", line 394, in __init__
    errread, errwrite)
  File "/usr/local/Cellar/python@2/2.7.16/Frameworks/Python.framework/Versions/2.7/lib/python2.7/subprocess.py", line 938, in _execute_child
    self.pid = os.fork()
OSError: [Errno 35] Resource temporarily unavailable
```

我修订成 `-p 10` 能够缓解，但是多次运行脚本依然出现问题。参考 [OSError: [Errno 35] Resource temporarily unavailable](https://github.com/sprintly/Sprintly-GitHub/issues/37) 这个问题和macOS的默认文件句柄数量限制有关。解决方法是放宽限制:

```
sudo launchctl limit maxfiles 1000000 1000000
```

不过，需要重新登陆一次（或者关闭iterm终端，重新启动一次iterm）。但是，似乎并没有完全解决这个问题，退出iterm2，重新启动后再次执行脚本完成。似乎是资源释放问题。

# 使用ssh密钥登陆

对于使用SSH密钥的登陆方式，需要使用参数 `-x` 来使用扩展ssh参数指定密钥登陆，举例：

```
pssh  -i  -h list_of_hosts  \
-x "-oStrictHostKeyChecking=no  -i /home/xxx/.ssh/ec2.pem" 'uptime'
```

也可以在 `~/.ssh/config` 指定扩展参数，例如

```
Host *.eu-west-1.compute.amazonaws.com
    StrictHostKeyChecking no
    IdentityFile ~/.ssh/ec2.pem
```

> 不过，最好的方法还是采用 keychain 来解决密钥认证，实际上就不需要使用 `-x` 参数来扩展。

## 对于密码保护的密钥

对于密码保护的密钥，建议使用 keychain 来解决密码输入

```
sudo apt-get install keychain
keychain ~/.ssh/id_rsa
. ~/.keychain/$(uname -n)-sh
```

然后执行 pssh 指令就不再需要输入密钥保护密码了。

建议在 `~/.bashrc` 中添加以下内容，则每次终端登陆就只要输入一次密钥保护密码就可以

```
keychain --clear $HOME/.ssh/id_rsa
. $HOME/.keychain/$(uname -n)-sh
```

> 应该也可以使用 [SSH密钥认证：ssh-agent](../../../service/ssh/ssh_key) 来实现一次输入保护密码的密钥认证

# 参考

* [Pssh – Execute Commands on Multiple Remote Linux Servers Using Single Terminal](https://www.tecmint.com/execute-commands-on-multiple-linux-servers-using-pssh/)
* [parallel-ssh](http://manpages.ubuntu.com/manpages/precise/man1/parallel-ssh.1.html)
* [pssh-howto.md](https://gist.github.com/carlessanagustin/c5e70c8edfa8408547545e26b61ab783)
* [parallel-ssh with Passphrase Protected SSH Key](https://unix.stackexchange.com/questions/128974/parallel-ssh-with-passphrase-protected-ssh-key)