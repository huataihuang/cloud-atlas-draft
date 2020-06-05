* 使用ping检测网络是否通

ping是检查主机是否alive的方法，加上参数可以只ping一次，并等待1秒：

```bash
if ping -c 1 -W 1 "$hostname_or_ip_address"; then
  echo "$hostname_or_ip_address is alive"
else
  echo "$hostname_or_ip_address is pining for the fjords"
fi
```

```bash
#!/bin/bash

ping -q -w1 -c1 google.com &>/dev/null && echo online || echo offline
```

ping默认网关检测

```bash
#!/bin/bash
ping -q -w 1 -c 1 `ip r | grep default | cut -d ' ' -f 3` > /dev/null && echo ok || echo error
```

* 使用wget

```bash
#!/bin/bash

wget -q --spider http://google.com

if [ $? -eq 0 ]; then
    echo "Online"
else
    echo "Offline"
fi
```

这里 `-q` 蚕食是Silence模式；`--spider`表示不是实际下载，而只是检测页面是否存在

* 使用nc检测端口

如果检查端口可参考 [Test if remote TCP port is open from a shell script](https://stackoverflow.com/questions/4922943/test-if-remote-tcp-port-is-open-from-a-shell-script)

```bash
nc -z <host> <port>
```

此外，交互检查(设置5秒超时):

```bash
nc -z -v -w5 <host> <port>
```

同样，返回值0表示成功，1表示失败

以下是案例脚本

```bash
#!/bin/bash

echo -e "GET http://google.com HTTP/1.0\n\n" | nc google.com 80 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Online"
else
    echo "Offline"
fi
```

* 也可以使用telnet来检查端口，但是要解决telnet超时问题（需要使用timeout命令):

```bash
l_TELNET=`echo "quit" | telnet $SERVER $PORT | grep "Escape character is"`
if [ "$?" -ne 0 ]; then
  echo "Connection to $SERVER on port $PORT failed"
  exit 1
else
  echo "Connection to $SERVER on port $PORT succeeded"
  exit 0
fi
```

* 以下是一个巧妙的检查端口脚本方法，并且使用了timeout来限制超时：

```bash
# Connection successful:
$ timeout 1 bash -c 'cat < /dev/null > /dev/tcp/google.com/80'
$ echo $?
0

# Connection failure prior to the timeout
$ timeout 1 bash -c 'cat < /dev/null > /dev/tcp/sfsfdfdff.com/80'
bash: sfsfdfdff.com: Name or service not known
bash: /dev/tcp/sfsfdfdff.com/80: Invalid argument
$ echo $?
1

# Connection not established by the timeout
$ timeout 1 bash -c 'cat < /dev/null > /dev/tcp/google.com/81'
$ echo $?
124
```



# 参考

* [Shell command/script to see if a host is alive?](https://unix.stackexchange.com/questions/190163/shell-command-script-to-see-if-a-host-is-alive)
* [How to test an Internet connection with bash?](https://stackoverflow.com/questions/929368/how-to-test-an-internet-connection-with-bash)