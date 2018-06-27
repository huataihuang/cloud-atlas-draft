在[安装XUbuntu](../ubuntu/install/install_xubuntu)提到了将Xubuntu桌面作为远程管理桌面的想法，这里我们来做一个实践。相关方法可以用于远程访问云计算的虚拟机中的Ubuntu桌面。

> VNC 也称为 "Virtual Network Computing"，是远程连接主机图形界面的一种方法，通常方便管理Linux桌面。为了安全，现在通常不会直接将VNC端口暴露在网络中，而是结合SSH tunnel使用，即先SSH到服务器上，通过SSH的端口转发方式访问主机`127.0.0.1`上开放的VNC端口避免外部攻击。

# 安装

* 在服务器上安装Xfce和TightVNC软件包

```
sudo apt-get update
sudo apt install xfce4 xfce4-goodies tightvncserver
```

* 为完成VNC服务器初始化配置，执行以下命令

```
vncserver
```

此时会提示输入和验证密码，以及可选的view-only密码。这个密码是远程访问VNC桌面的密码，可以设置和用户帐号密码不同。

# 配置VNC Server

首先需要告诉VNC server启动时需要执行的指令。这些指令位于用户目录的`.vnc`目录下的`xstartup`文件。这个文件已经在刚才执行`vncserver`时候创建了，但是我们需要修改这个文件以便启动Xfce桌面。

> 注意：上述需要修改配置是因为默认的Ubuntu使用的是Gnome桌面。如果你使用Xubuntu，则默认是Xfce桌面，就不需要修改这个配置。
>
> 对于Xubuntu，这个默认配置内容已经足够：

```
#!/bin/sh

xrdb $HOME/.Xresources
xsetroot -solid grey
#x-terminal-emulator -geometry 80x24+10+10 -ls -title "$VNCDESKTOP Desktop" &
#x-window-manager &
# Fix to make GNOME work
export XKL_XMODMAP_DISABLE=1
/etc/X11/Xsession
```

当VNC首次启动时，默认服务会话监听`5901`端口，也称为显示端口，并且在VNC中引用为`:1`。VNC可以启动多个会话分别监听不同端口，例如`:2`，`:3`。注意：VNC所引用的`:X`端口，对应的就是`5900+X`端口。

由于我们需要修改VNC server配置，所以，我们先停止VNC服务会话：

```
vncserver -kill :1
```

备份原有配置

```
mv ~/.vnc/xstartup ~/.vnc/xstartup.bak
```

修改`~/.vnc/xstartup`内容如下

```
#!/bin/bash
xrdb $HOME/.Xresources
startxfce4 &
```

并且需要设置该文件可执行属性 

```
sudo chmod +x ~/.vnc/xstartup
```

然后再次启动vnc服务

```
vncserver
```

# 连接VNC桌面

由于安全要求，VNC默认只监听本地端口，所以需要通过SSH tunnel访问。在本地客户端执行如下命令创建

```
ssh -L 5901:127.0.0.1:5901 -N -f -l username -C server_ip_address
```

> 建议使用`-C`参数压缩VNC网络通讯，否则延迟明显。

然后通过VNC客户端访问自己本地`127.0.0.1`端口`5901`即可以访问远程桌面

# 创建VNC服务文件

* 配置`/etc/systemd/system/vncserver@.service`文件内容如下

```
[Unit]
Description=Start TightVNC server at startup
After=syslog.target network.target

[Service]
Type=forking
User=sammy
PAMName=login
PIDFile=/home/sammy/.vnc/%H:%i.pid
ExecStartPre=-/usr/bin/vncserver -kill :%i > /dev/null 2>&1
ExecStart=/usr/bin/vncserver -depth 24 -geometry 1280x800 :%i
ExecStop=/usr/bin/vncserver -kill :%i

[Install]
WantedBy=multi-user.target
```

> `注意`：上述案例配置中，一定要将用户名`sammy`修改成你实际的用户名

* 然后执行加载

```
sudo systemctl daemon-reload
```

* 激活单元配置

```
sudo systemctl enable vncserver@1.service
```

* 手工启动

```
vncserver -kill :1

sudo systemctl start vncserver@1
```

* 验证服务：

```
sudo systemctl status vncserver@1
```

# VNC客户端的选择和使用

从ubuntu 12开始，默认的vnc客户端是[Vinagre](https://en.wikipedia.org/wiki/Vinagre)。该软件支持多种协议 VNC，RDP，SPICE。

对于轻量级发行版xubuntu，建议使用`xvnc4viewer` (RealVNC viewer)，安装非常小巧，功能也很单一。不过，在访问远程vnc桌面时，本地鼠标和远程桌面鼠标不能重合非常麻烦，影响操作效率。（这个鼠标重合问题可以通过改用`Vinagre`来解决）

> `xvnc4viewer`功能非常简洁，甚至连菜单也没有，直接通过命令行运行，例如，访问192.168.1.218的5904端口： `xvncviewer 192.168.1.218:5904`。
>
> 注意：需要向vnc发送`ctrl-alt-del`时，需要在客户端按下`F8`按键，通过菜单来选择

要使用方便，还是使用默认的`vinagre`客户端更为方便，虽然底层也使用`xvnc4viewer`来实现VNC协议，但是很好解决了本地和远程鼠标一致的问题，非常方便。需要注意的是，默认会将本地鼠标和键盘完全映射发送给远程服务器，如果要鼠标键盘脱离远程连接，需要同时按下`ctrl+alt`按键。

# 参考

* [How to Install and Configure VNC on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-vnc-on-ubuntu-16-04)
* [VNC/Clients](https://help.ubuntu.com/community/VNC/Clients)
* [Best VNC/remote desktop application?](https://askubuntu.com/questions/438002/best-vnc-remote-desktop-application)