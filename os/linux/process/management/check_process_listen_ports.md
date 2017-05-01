检查进程使用的网络端口可以使用如下命令

* netstat
* fuser
* lsof
* /proc/$pid/ 文件系统

# netstat案例

```
netstat -tulpn
```

输出

```
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address               Foreign Address             State       PID/Program name
tcp        0      0 0.0.0.0:19211               0.0.0.0:*                   LISTEN      22875/java
tcp        0      0 0.0.0.0:19212               0.0.0.0:*                   LISTEN      22875/java
tcp        0      0 0.0.0.0:111                 0.0.0.0:*                   LISTEN      991/rpcbind
tcp        0      0 0.0.0.0:80                  0.0.0.0:*                   LISTEN      12455/nginx
...
```

如果要检查具体的程序路径，例如想知道`12455`进程的运行程序指令，可以使用命令

```
ls -l /proc/12455/exe
```

输出显示进程对应的指令

```
lrwxrwxrwx 1 root root 0 Apr 14 15:06 /proc/12455/exe -> /opt/tengine-xxxx/bin/tengine
```

# fuser案例

fuser可以检查具体的端口，例如

```
fuser 7001/tcp
```

输出显示进程pid

```
7001/tcp:            15535
```

同样可以`ls -l /proc/15535/exe`检查具体进程的路径

有一个`pwdx`命令还可以检查进程的工作目录

```
pwdx 15535
```

等同于 `ls -l /proc/15535/cwd`

# 找出进程的属主，启动时间等

```
ps -eo pid,user,group,args,etime,lstart | grep '[1]5535'
```

输出显示

```
15535 admin    admin    /opt/taobao/java/bin/java -  3-00:13:33 Tue Apr 11 15:23:14 2017
```

进程的`environ`提供了详细的信息，也包含了用户，及路径等等

```
cat /proc/15535/environ
```

或者

```
grep --color -w -a USER /proc/15535/environ
```

# lsof案例

```
lsof -i :portNumber 
lsof -i tcp:portNumber 
lsof -i udp:portNumber 
lsof -i :80
lsof -i :80 | grep LISTEN
```

> 这里 `lsof -i :portNumber` 可以显示双向的端口连接
>
> 执行`lsof`需要`root`权限，否则无法显示非自己属主的进程的端口使用

案例

```
# lsof -i :80

COMMAND     PID   USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
httpd      3243   root    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      8125 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      8125 apache   25u  IPv6 7091871      0t0  TCP devstack:http->30.17.42.133:59611 (ESTABLISHED)
httpd      8126 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      8126 apache   25u  IPv6 7091892      0t0  TCP devstack:http->devstack:39920 (ESTABLISHED)
httpd      8133 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      8133 apache   25u  IPv6 7090512      0t0  TCP devstack:http->devstack:39926 (ESTABLISHED)
httpd      9142  stack   13u  IPv4 7093003      0t0  TCP devstack:39912->devstack:http (ESTABLISHED)
httpd      9142  stack   14u  IPv4 7091891      0t0  TCP devstack:39920->devstack:http (ESTABLISHED)
httpd      9151  stack   13u  IPv4 7088688      0t0  TCP devstack:39892->devstack:http (CLOSE_WAIT)
httpd      9152  stack   13u  IPv4 7092369      0t0  TCP devstack:39888->devstack:http (CLOSE_WAIT)
httpd      9153 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      9153 apache   25u  IPv6 7090503      0t0  TCP devstack:http->devstack:39912 (ESTABLISHED)
httpd      9155 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      9156 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      9157 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      9431 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      9431 apache   25u  IPv6 7096075      0t0  TCP devstack:http->devstack:39918 (ESTABLISHED)
httpd      9440 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
httpd      9480 apache    4u  IPv6  119226      0t0  TCP *:http (LISTEN)
nova-api  23791  stack    9u  IPv4 7091899      0t0  TCP devstack:39926->devstack:http (ESTABLISHED)
neutron-s 24592  stack    9u  IPv4 7090509      0t0  TCP devstack:39918->devstack:http (ESTABLISHED)
nova-comp 32356  stack   16u  IPv4 7088675      0t0  TCP devstack:39884->devstack:http (CLOSE_WAIT)
```

# 参考

* [Linux: Find Out Which Process Is Listening Upon a Port](https://www.cyberciti.biz/faq/what-process-has-open-linux-port/)