> [在Android中运行Linux](../../../develop/android/linux/deploy_linux_on_android)实现了将Kali Linux运行在一台小小的Nexus 5手机中，接下来我们要通过远程访问方式来使用Kali Linux的图形桌面，方便探索安全工具。

> 不要问我为何要这么折腾在手机中运行一个安全黑客发行版本的Kali Linux，而且还要通过远程图形方式访问。为何不简简单单在电脑上安装一个操作系统，甚至最低端的计算机硬件性能也远好于Nexus 5这个几年前发布的手机。不为什么，就是为了好玩，为了探索不可能。。。

> [在树莓派Zero W上运行Kali Linux](../../../develop/raspberry_pi/running_kali_linux_on_raspberry_pi_zero_w)可以实现随插随用的安全扫描Linux系统，也是一个非常好玩的应用场景。

其实，VNC远程访问Linux服务器是非常古老的技术，但是这个技术一直有着简单实用的价值，直到今天依然是远程访问 Linux/Unix 服务器图形系统的利器。在虚拟化平台，也使用[远程访问VNC](../../../virtual/libvirt/remote_vnc)来访问虚拟机的控制台桌面。

此外，另外一种适合Linux/Mac客户端的远程图形桌面访问方式是使用X Window原生的远程访问模式，例如[从mac上访问远程X window](../x/remote_x_from_mac)，甚至都不需要使用vnc客户端，只需要客户端和服务器都是相似架构的X Window系统就可以了。

# 准备

* Kali Linux的服务器上应运行ssh服务，以便实现通过ssh tunnel方式访问VNC服务器端口

# TightVNC

* 安装TightVNC server软件包：

```
apt-get install tightvncserver
```

* 安装`autocutset`以便在开户端和服务器之间激活`cut&paste`功能

```
apt-get install autocutsel
```

## 运行vncserver

* 首先给自己的账号设置vnc密码：

```
vncpasswd
```

* 启动vnc服务，监听5901端口（`:1`）

```
vncserver :1
```

此时可以通过`ps`检查到服务端的vnc进程

```
Xtightvnc :1 -desktop X -auth /home/huatai/.Xauthority -geometry 1024x768 -depth 24 -rfbwait 120000 -rfbauth /home/huatai/.vnc/passwd -rfbport 5901 -fp /usr/share/fonts/X11/misc/,/usr/share/fonts/X11/Type1/,/usr/share/fonts/X11/75dpi/,/usr/share/fonts/X11/100dpi/ -co /etc/X11/rgb
```

## 配置VNC服务支持剪贴板

可以配置VNC启动脚本来激活cut & paste

编辑`~/.vnc/xstartup`

```bash
#!/bin/sh
xrdb $HOME/.Xresources
xsetroot -solid grey
autocutsel -fork
# Fix to make GNOME work
export XKL_XMODMAP_DISABLE=1
/etc/X11/Xsession
```

## 客户端访问

前述的vnc服务器启动参数实际上是监听了所有端口，存在一定的安全隐患。

可以设置VNC服务启动回环地址

```
vncserver :1 -geometry 1280x800 -depth 16 -localhost -nolisten tcp
```

`-nolisten tcp`参数启动后，可以看到只监听`127.0.0.1:5901`

## 通过SSH tunnerl

在客户端使用以下ssh命令

```
ssh -L 5901:localhost:5901 -N -f <distant_user>@<server_ip>
```

此时vnc客户端就可以访问自己本地的回环地址来访问服务器

```
xtightvncviewer localhost:1 -compresslevel 9 -quality 4 -depth 8
```

# 启动时激活VNC

* 启动脚本`/etc/init.d/vncboot`

```bash
#!/bin/sh
### BEGIN INIT INFO
# Provides: vncboot
# Required-Start: $remote_fs $syslog
# Required-Stop: $remote_fs $syslog
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: Start VNC Server at boot time
# Description: Start VNC Server at boot time.
### END INIT INFO
 
USER=root
HOME=/root
export USER HOME
 
case "$1" in
 start)
   echo "Starting VNC Server"
   /usr/bin/vncserver :1 -geometry 1280x800 -depth 16 -localhost -nolisten tcp
   ;;
 
 stop)
   echo "Stopping VNC Server"
   /usr/bin/vncserver -kill :1
   ;;
 
 *)
   echo "Usage: /etc/init.d/vncboot {start|stop}"
   exit 1
   ;;
esac
 
exit 0
```

* 激活启动

```
chmod 755 /etc/init.d/vncboot
update-rc.d vncboot defaults
```

# 参考

* [VNC to access Kali Linux on Raspberry Pi](http://blog.sevagas.com/?VNC-to-access-Kali-Linux-on-Raspberry-Pi)