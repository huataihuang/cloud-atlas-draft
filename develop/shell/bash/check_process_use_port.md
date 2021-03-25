在维护Linux系统时，经常需要检查一个端口上是否被进程使用，这样可以避免在相同端口上启动多个进程，造成端口冲突。

# 检查端口占用

* 在物理服务器上，使用 ``netstat`` 命令可以检查端口使用:

```
netstat -tulpn | grep LISTEN
```

参数解释：

  * `-t` 只显示TCP端口
  * `-u` 只显示UDP端口
  * `-l` 只显示监听端口
  * `-p` 显示打开sockets端口的进程名
  * `-n` 不解析服务名字，例如 `53` 端口不会解析成DNS

输出类似

```
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:14500           0.0.0.0:*               LISTEN      1/systemd
tcp        0      0 127.0.0.1:21003         0.0.0.0:*               LISTEN      4096/docker-proxy
tcp        0      0 127.0.0.1:14861         0.0.0.0:*               LISTEN      4543/docker-proxy
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      1/systemd
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1653/nginx: master
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1302/sshd
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN      1252/cupsd
tcp        0      0 127.0.0.1:33401         0.0.0.0:*               LISTEN      21430/docker-proxy
tcp        0      0 127.0.0.1:32351         0.0.0.0:*               LISTEN      5006/docker-proxy
```

不过，这个命令对于Docker容器中进程监听端口不能展示，所以我觉得还是不够完善。不过， **fuser** 可以补充解决：

```
fuser 22/tcp
```

可以显示出所有监听22端口的进程pid:

```
22/tcp:               1302 337409 337424
```

你会看到物理主机的sshd进程pid 1302 以及在docker容器内部的sshd进程pid 337409 337424 ，这样就方便我们进一步去排查docker容器中进程问题。

- 此外，使用 `lsof` 可以检查详情

```
lsof -i :portNumber 
lsof -i tcp:portNumber 
lsof -i udp:portNumber 
lsof -i :80
lsof -i :80 | grep LISTEN
```

# 排查容器进程

我非常推荐结合 `fuser` 命令和 `systemd` 的命令 `systemd-cgls` 。为什么呢？ 原因是通过 `fuser` 可以找到服务器上所有监听某个端口，例如 `22` 端口的进程，然后通过进程pid，在 `systemd-cgls` 输出中查找，就能找到对应容器：

- 举例，我使用如下命令找到系统中使用了端口22的所有进程:

```bash
#fuser 22/tcp
22/tcp:               1302 337409 337424
```

- 然后通过 `systemd-cgls` 的树形输出来查找服务pid对应的容器

# 参考

* [Linux Find Out Which Process Is Listening Upon a Port](https://www.cyberciti.biz/faq/what-process-has-open-linux-port/)
* [How to check if port is in use on Linux or Unix](https://www.cyberciti.biz/faq/unix-linux-check-if-port-is-in-use-command/)
