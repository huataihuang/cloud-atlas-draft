[在树莓派Zero W上运行Kali Linux](../../../develop/raspberry_pi/running_kali_linux_on_raspberry_pi_zero_w)可以让我们在小巧的树莓派上运行一个强大的Kali Linux系统。但是树莓派硬件资源有限，需要定制一个尽可能轻量级的桌面。

对于常规使用Kali Linux，例如在笔记本电脑上，推荐使用Xfce 4桌面，功能完善且相对Gnome/KDE要轻量级：

```
apt-get install xfce4
```

> 安装浏览器，可以选择`apt-get install firefox-esr`。包管理可以安装`synaptic`: `apt-get install synaptic`

不过，Xfce4对于树莓派这样的ARM移动平台，依然消耗资源过多。能够压榨出更多的资源用于性能，是每个SA的追求，所以我们尝试i3 window manager:

```
apt-get install i3
```

# 远程VNC访问

## NAT masquerade

树莓派Zero W(C)插在Linux Ubuntu 16.04 LTS的远程主机B上，当前工作在笔记本A上，部署的结构采用：

```
A => B => C
```

其中B采用了Ubuntu ufw构建了防火墙，参考架构[使用ufw配置NAT masquerade](../../os/linux/network/firewall/ufw/nat_masquerade_in_ufw)

```
# nat Table rules
*nat
:PREROUTING ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]

# Kali
-A PREROUTING -i wlp3s0 -p tcp --dport 732 -j DNAT --to-destination 192.168.7.10:22

-A POSTROUTING -s 192.168.7.0/24 -o wlp3s0 -j MASQUERADE
```

> `wlp3s0`是提供NAT masquerade的无线网卡接口

## VNC安装配置

* 安装TightVNC server软件包：

```
apt-get install tightvncserver
```

* 安装`autocutset`以便在开户端和服务器之间激活`cut&paste`功能

```
apt-get install autocutsel
```

* 首先给自己的账号设置vnc密码：

```
vncpasswd
```

## i3配置

* 键盘绑定

在`i3`中，命令是通过一个`modifier key`来调用的，称为`$mod`。默认`$mod`是`Alt`（Mod1）键。另外，`Super`(Mod4)也是非常流行的替换绑定键。这个`Super`键在PC键盘中是Windows图标键，或者在Apple键盘上则是`Command`键。

* 程序加载

`i3`使用`dmenu`作为应用程序加载起，默认使用`$mod+d`来调用

* 桌面壁纸

> 注意：`i3`不包含任何桌面，也不提供背景（墙纸），所以通常需要使用`feh`一个轻量级图片浏览器命令行设置屏幕背景。不过，也可以使用一个`nitrogen`来实现浏览`/usr/share/wallpappers`目录下的图片，然后选择喜欢的图片，点击`Apply`则可以再以后恢复这个图片。
>
> `feh`设置背景图片的方法参考[Archlinux:Feh](https://wiki.archlinux.org/index.php/Feh)

```
feh --bg-scale /path/to/image.file
```

> 其他可以使用的参数

```
--bg-tile FILE
--bg-center FILE
--bg-max FILE
--bg-fill FILE
```

要在下次登陆时候恢复背景图片则在启动配置（如`~/.xinitrc`或者`~/.config/openbox/autostart`）中添加

```
~/.fehbg &
```

> 注意：先创建一个普通用户账号并使用普通用户账号登陆后再使用上述命令较好，这样日常可以使用普通用户，必要时使用`sudo`切换超级账号权限。

* `i3`配置文件位于`~/.config/i3/config`

```bash
exec --no-startup-id feh --bg-center "/home/huatai/.config/i3/kali_linux.jpg"

set $mod Mod4

# start a terminal
bindsym $mod+Return exec rxvt

# start dmenu (a program launcher)
bindsym $mod+d exec dmenu_run

# change focus
bindsym $mod+j focus left
bindsym $mod+k focus down
bindsym $mod+l focus up
bindsym $mod+semicolon focus right

# alternatively, you can use the cursor keys:
bindsym $mod+Left focus left
bindsym $mod+Down focus down
bindsym $mod+Up focus up
bindsym $mod+Right focus right

# move focused window
bindsym $mod+Shift+j move left
bindsym $mod+Shift+k move down
bindsym $mod+Shift+l move up
bindsym $mod+Shift+semicolon move right

# alternatively, you can use the cursor keys:
bindsym $mod+Shift+Left move left
bindsym $mod+Shift+Down move down
bindsym $mod+Shift+Up move up
bindsym $mod+Shift+Right move right

# split in horizontal orientation
bindsym $mod+h split h

# split in vertical orientation
bindsym $mod+v split v

# enter fullscreen mode for the focused container
bindsym $mod+f fullscreen toggle

# change container layout (stacked, tabbed, toggle split)
bindsym $mod+s layout stacking
bindsym $mod+w layout tabbed
bindsym $mod+e layout toggle split

# toggle tiling / floating
bindsym $mod+Shift+space floating toggle

# change focus between tiling / floating windows
bindsym $mod+space focus mode_toggle

# focus the parent container
bindsym $mod+a focus parent

# switch to workspace
bindsym $mod+1 workspace 1
bindsym $mod+2 workspace 2
bindsym $mod+3 workspace 3
bindsym $mod+4 workspace 4
bindsym $mod+5 workspace 5
bindsym $mod+6 workspace 6
bindsym $mod+7 workspace 7
bindsym $mod+8 workspace 8
bindsym $mod+9 workspace 9
bindsym $mod+0 workspace 10

# move focused container to workspace
bindsym $mod+Shift+1 move container to workspace 1
bindsym $mod+Shift+2 move container to workspace 2
bindsym $mod+Shift+3 move container to workspace 3
bindsym $mod+Shift+4 move container to workspace 4
bindsym $mod+Shift+5 move container to workspace 5
bindsym $mod+Shift+6 move container to workspace 6
bindsym $mod+Shift+7 move container to workspace 7
bindsym $mod+Shift+8 move container to workspace 8
bindsym $mod+Shift+9 move container to workspace 9
bindsym $mod+Shift+0 move container to workspace 10

# reload the configuration file
bindsym $mod+Shift+c reload
# restart i3 inplace (preserves your layout/session, can be used to upgrade i3)
bindsym $mod+Shift+r restart
# exit i3 (logs you out of your X session)
bindsym $mod+Shift+e exec "i3-nagbar -t warning -m 'You pressed the exit shortcut. Do you really want to exit i3? This will end your X session.' -b 'Yes, exit i3' 'i3-msg exit'"

# resize window (you can also use the mouse for that)
mode "resize" {
        # These bindings trigger as soon as you enter the resize mode

        # Pressing left will shrink the window’s width.
        # Pressing right will grow the window’s width.
        # Pressing up will shrink the window’s height.
        # Pressing down will grow the window’s height.
        bindsym j resize shrink width 10 px or 10 ppt
        bindsym k resize grow height 10 px or 10 ppt
        bindsym l resize shrink height 10 px or 10 ppt
        bindsym semicolon resize grow width 10 px or 10 ppt

        # same bindings, but for the arrow keys
        bindsym Left resize shrink width 10 px or 10 ppt
        bindsym Down resize grow height 10 px or 10 ppt
        bindsym Up resize shrink height 10 px or 10 ppt
        bindsym Right resize grow width 10 px or 10 ppt

        # back to normal: Enter or Escape
        bindsym Return mode "default"
        bindsym Escape mode "default"
}

bindsym $mod+r mode "resize"

# set bar status
bar {
status_command i3status
}
```

> `semicolon`是`分号`键，通常用`j k l ;`来控制方向

* 编辑`~/.vnc/xstartup`

```bash
#!/bin/sh
xrdb $HOME/.Xresources
xsetroot -solid grey
autocutsel -fork
# Fix to make GNOME work
export XKL_XMODMAP_DISABLE=1
/etc/X11/Xsession
```

* 启动vnc服务，监听5901端口（`:1`）

```
vncserver :1
```

此时`ps aux | grep vnc`可以看到对应进程如下：

```
Xtightvnc :1 -desktop X -auth /home/huatai/.Xauthority -geometry 1024x768 -depth 24 -rfbwait 120000 -rfbauth /home/huatai/.vnc/passwd -rfbport 5901 -fp /usr/share/fonts/X11/misc/,/usr/share/fonts/X11/Type1/,/usr/share/fonts/X11/75dpi/,/usr/share/fonts/X11/100dpi/ -co /etc/X11/rgb
```

* 停止vnc服务：

```
vncserver -kill :1
```

# macOS使用的困惑

在实践中，客户端是macOS系统，尝试了chicken和vnc客户端，都无法正确使用`$mod`键。暂时找不到解决方法。

> 或许使用Xfce4才是最简洁的方法

# 参考

* [How to customise your Linux desktop: Kali Linux and i3 Window Manager](http://www.zdnet.com/article/how-to-customise-your-linux-desktop-kali-linux-and-i3-window-manager/)
* [i3wm平铺式桌面管理器](https://v4if.coding.me/2016/i3wm%E5%B9%B3%E9%93%BA%E5%BC%8F%E6%A1%8C%E9%9D%A2%E7%AE%A1%E7%90%86%E5%99%A8/)
* [archlinux: i3](https://wiki.archlinux.org/index.php/i3)
* [How to install/remove different Desktop/Window Manager in Kali Linux 1.x](https://forums.kali.org/showthread.php?17716-How-to-install-remove-different-Desktop-Window-Manager-in-Kali-Linux-1-x) 介绍了如何安装和切换不同桌面的方法