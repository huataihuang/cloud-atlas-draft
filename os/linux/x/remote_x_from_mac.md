# X11.app

[XQuartz](https://en.wikipedia.org/wiki/XQuartz)是Apple公司提供的X Server，实现了X Window系统。最初X11.app是随着Mac OS X 10.2 Jaguar一起发行的。但是从OS X 10.8 Mountain Lion开始，苹果公司放弃了X11.app，而是采用开源的XQuarz项目来发布。

最新的XQuarz稳定版本是2.7.11，发布时间是2016-10-29。XQuartz不提供高分辨率的Retina显示X11应用，只支持2D图形硬件加速，通过Aqua实现硬件OpenGL加速和集成。

> [OroborOSX](http://oroborosx.sourceforge.net/) 是一个已经不在开发的X11 for Mac OS X（2004年），实现了一个在Mac OS X上运行的XDarwin系统，算是一个有意思的开源项目。

# 使用XQuartz

* 从[XQuartz](https://www.xquartz.org)官方网站下载最新的 XQuartz-2.7.11.dmg 安装，安装以后需要log out然后再log in一次系统后就会将XQuartz作为默认X Window
* 启动XQuartz之后，需要通过XQuartz内置的Terminal来登陆远程Linux服务器，这样才能在登陆之后看到正确的X11Forwarding结果，也就是登陆Linux系统后，检查环境变量：

```
env | grep DISPLAY
```

显示输出是 `DISPLAY=localhost:10.0`。如果没有使用XQuartz中的Terminal来远程ssh到服务器上，而是使用macOS内建的terminal，则不会有上述环境变量，并且即使登陆Linux服务器后手工输入环境变量 `export DISPLAY="localhost:10.0"` 也不能工作。

> 详细的客户端和服务器端配置见下文

# ssh方式使用X远程访问

在Linux服务器上`/etc/ssh/sshd_config`添加设置

```bash
X11Forwarding yes
```

> 服务器要求安装`xauth`软件，否则会导致无法打开`DISPLAY`（即登陆后`env | gzA`）

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

> 注意：如果使用了[ssh多路传输multiplexing加速](../../../service/ssh/multiplexing)技术，务必需要清理掉本地的ssh `ControlPath`文件，重新ssh登陆，否则新的ssh客户端访问选项`X11Forwarding`无法生效。

要验证`X11Forwarding`是否正常工作，可以在服务器上执行一个简单的X Window程序，看是否能否正常显示在本地客户端桌面。例如，使用`xev`程序（一个简单显示鼠标位置的X程序）。

> 尝试了在Linux服务器运行`code`开发IDE(通过无线局域网)，但是发现窗口刷新性能实在太差，无法满足使用要求。（不过，如果是高速网络或者虚拟机通过sockets端口访问可能可以满足性能。）所以对于复杂的交互图形界面，使用X window远程模式实用性较低。甚至不如直接在本地sshfs挂载远程服务器目录，然后在本地运行`code`进行开发（这种模式解决了图形问题，但是磁盘io是一个较大的瓶颈，如果有大量的文件搜索则效率很低）。

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

在最新的macOS系统中，使用 `ssh -XC SERVER_IP` 会遇到X11安全检查导致实际上没有生效，甚至都不出现上述报错(说明根本没有启用X11转发)。参考 [X11 from ssh on Mac OSX to Linux server doesn't work — Gtk-WARNING **: cannot open display](https://serverfault.com/questions/137090/x11-from-ssh-on-mac-osx-to-linux-server-doesnt-work-gtk-warning-cannot) 可以看到，应该将 `-X` 改成 `-Y` 可以绕过X11安全检查。

此时就会在终端显示信息 `X11 forwarding request failed` 接下来就是解决认证。

这个认证是需要在服务器上安装 `xauth` 程序来完成，所以在CentOS服务器上执行安装 `yum install xauth` ，安装完成后，再次执行:

```bash
ssh -YC <SERVER_IP>
```

就可以看到X终端显示一个提示 `/usr/bin/xauth: file /home/huatai/.Xauthority does not exist` ，不过这个文件会自动创建。

此时在通过 `XQuartz` 的 `xterm` 登陆的服务器上执行：

```bash
env | grep DISPLAY
```

就会看到正确输出

```
DISPLAY=localhost:10.0
```

此时远程服务器上执行X程序都会在本地macOS桌面显示

----
以下两个方法验证不行：

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