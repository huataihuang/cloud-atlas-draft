[在树莓派Zero W上运行Kali Linux](../../../develop/raspberry_pi/running_kali_linux_on_raspberry_pi_zero_w)可以让我们在小巧的树莓派上运行一个强大的Kali Linux系统。但是树莓派硬件资源有限，需要定制一个尽可能轻量级的桌面。

对于常规使用Kali Linux，例如在笔记本电脑上，推荐使用Xfce 4桌面，功能完善且相对Gnome/KDE要轻量级：

```
apt-get install xfce4
```

> 安装浏览器，可以选择`apt-get install firefox-esr`。包管理可以安装`synaptic`: `apt-get install synaptic`

不过，Xfce4对于树莓派这样的ARM移动平台，依然消耗资源过多。能够压榨出更多的资源用于性能，是每个SA的追求，所以我们尝试i3 window manager:

# 远程VNC访问

树莓派Zero W(C)插在Linux Ubuntu 16.04 LTS的远程主机B上，当前工作在笔记本A上，部署的结构采用：

```
A => B => C
```

其中B采用了Ubuntu ufw构建了防火墙，参考架构[使用ufw配置NAT masquerade](../../os/linux/network/firewall/ufw/nat_masquerade_in_ufw)

端口映射： 7102 => 192.168.7.10:22

# 安装i3

```

```



# 参考

* [How to customise your Linux desktop: Kali Linux and i3 Window Manager](http://www.zdnet.com/article/how-to-customise-your-linux-desktop-kali-linux-and-i3-window-manager/)