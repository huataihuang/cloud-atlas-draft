nc是一个非常神奇的万能网络工具，可以用来侦测端口，监听端口，传输文件，是系统维护极其重要的工具。

# 检查端口是否打开

```
nc -z <server_ip> <server_port>
```

`<server_port>`可以使用范围，例如`5900-5910`

此时脚本执行不在终端输入任何内容，但是返回值如果是0就表示端口打开

`-z`参数表示不发送任何数据给服务器，只检查端口是否打开。如果要有显示输出责使用`-v`参数。 

举例：

```
nc -z -v 127.0.0.1 5900-5903
```

输出

```
Connection to 127.0.0.1 5900 port [tcp/*] succeeded!
nc: connect to 127.0.0.1 port 5901 (tcp) failed: Connection refused
nc: connect to 127.0.0.1 port 5902 (tcp) failed: Connection refused
nc: connect to 127.0.0.1 port 5903 (tcp) failed: Connection refused
```

注意，现在使用的nmap netcat 不支持参数`-z`，需要在版本 ncat 7.25beta2才引入了`-z`参数，但是只能扫描一个端口，连续端口扫描需要使用nmap。解决的方法是采用以下脚本

```
ncat google.com 80 </dev/null >/dev/null && echo "yes"
```

# 搭建端口转发

> 参考 [Forwarding ports using netcat](https://29a.ch/2009/5/10/forwarding-ports-using-netcat)

```
nc -l -p $localport -c "nc $remotehost $remoteport"
```

例如：

```
nc -l -p 8888 -c "nc example.com 8888"
```

不过，实际现在采用的netcat软件包，需要采用如下命令：

> 参考 [Using netcat in windows to forward a tcp door to another machine](https://serverfault.com/questions/332217/using-netcat-in-windows-to-forward-a-tcp-door-to-another-machine/504259#504259)

```
netcat -L example.com:8888 -p 8888 -vvv
```

# 参考

* [How to Check Remote Ports are Reachable Using ‘nc’ Command](https://www.tecmint.com/check-remote-port-in-linux/)
* [Check if remote host/port is open - Can't use GNU Netcat nor NMap - RHEL 7](https://serverfault.com/questions/788934/check-if-remote-host-port-is-open-cant-use-gnu-netcat-nor-nmap-rhel-7)