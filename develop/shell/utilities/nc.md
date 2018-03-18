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

# 参考

* [How to Check Remote Ports are Reachable Using ‘nc’ Command](https://www.tecmint.com/check-remote-port-in-linux/)