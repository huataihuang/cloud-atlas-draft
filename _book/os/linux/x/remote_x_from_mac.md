# ssh方式使用X远程访问

在Linux服务器上`/etc/ssh/sshd_config`添加设置

```bash
X11Forwarding yes
```

> 服务器要求安装`xauth`软件，否则会导致无法打开`DISPLAY`

客户端`/etc/ssh/ssh_config`或`~/.ssh/config`添加设置

```bash
ForwardX11 yes
```

在客户端使用`ssh -XC`访问服务器

```bash
ssh -XC root@SERVER_IP
```

`-X` - Enables X11 forwarding，这样远程访问的图形程序将显示在本地X系统
`-C` - 开启压缩，对于慢速链路会有很大的改善

登录服务器之后，使用如下命令检查环境

```bash
echo $DISPLAY
```

如果输出内容是 `localhost:10.0` 就表示远程主机已经启用了转发。

如果上述输出是空白，则可以手工设置

```bash
export DISPLAY="localhost:10.0"
```

# ssh进行X转发解决"untrusted X11 forwarding"

在使用 `ssh -X SERVER_IP` 时服务器提示

```bash
Warning: untrusted X11 forwarding setup failed: xauth key data not generated
Warning: No xauth data; using fake authentication data for X11 forwarding.
```

解决的方法参考 [Untrusted X11 forwarding setup failed](http://www.pubbs.net/freebsd/200906/32809/)

> See the ssh(1) manual for information on the -X and -Y options, and ssh-config(5) for information on ForwardX11Trusted.

客户端`/etc/ssh/ssh_config`或`~/.ssh/config`添加设置

```bash
Host *
ForwardAgent yes
ForwardX11 yes
ForwardX11Trusted yes
```

服务器端`/etc/ssh/sshd_config`确保如下设置

```
AllowTcpForwarding yes
X11Forwarding yes
X11DisplayOffset 10
X11UseLocalhost yes
```

# 解决"X11 forwarding request failed"

在Mac OS X的X window系统`XQuartz`中使用`ssh -XC SERVER_IP`远程登录Linux服务器，在X terminal客户端看到如下输出信息

```
X11 forwarding request failed
```

[How to fix “X11 forwarding request failed on channel 0”](http://ask.xmodulo.com/fix-broken-x11-forwarding-ssh.html)提供了两种可能的解决方法：

* 方法一

由于安全原因，OpenSSH服务默认是将X11 forwarding服务绑定到localhost回环地址，并且设置DISPLAY的环境变量是`localhost`。有些X11客户端不能处理X11 forwarding就会报错。处理方法是设置`/etc/ssh/sshd_config`设置允许绑定到所有的网卡地址

```bash
X11Forwarding yes
X11UseLocalhost no
```

* 方法二

对于一些SSH服务器禁止了IPv6，则会可能会中断X11 forwarding。要解决这种错误，则将`/etc/ssh/sshd_config`配置中的 `AddressFamily any` 修改成只使用IPv4

```bash
AddressFamily inet
```

> 很不幸，我在Mac OS X上遇到的问题上述两种方法都没有解决。

# 参考

* [Untrusted X11 forwarding setup failed](http://www.pubbs.net/freebsd/200906/32809/)
* [How do I access my remote Ubuntu server via X-windows from my Mac?](http://askubuntu.com/questions/163155/how-do-i-access-my-remote-ubuntu-server-via-x-windows-from-my-mac)
* [How to fix “X11 forwarding request failed on channel 0”](http://ask.xmodulo.com/fix-broken-x11-forwarding-ssh.html)