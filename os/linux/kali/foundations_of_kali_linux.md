Kali Linux是一个特殊的Linux操作系统发行版，针对的是希望从事安全工作的人。例如安全测试，例如漏洞开发或者逆向工程，或者也可以用于数字取证。

> Linux实际上指的是内核，结合大量的GNU自由软件，可以让使用者能够完成原先在复杂昂贵的Unix平台上才能完成的计算工作。而不同的软件包组合打包，以及不同的包管理工具，形成了不通流派的发行版，例如，Debian系列及其衍生发行版Ubuntu，Red Hat系列机器衍生发行版CentOS等等。

Kali Linux就是一个基于Debian的特殊发行版，提供了大量的安全工具。

> Linux的历史源远流长 - [wikipedia Linux](https://en.wikipedia.org/wiki/Linux)

# 安装

Kali Linux提供了CD，DVD和基于U盘的安装介质镜像，安装过程也非常简单，类似常规的发行版，简单而直白。

为了能够降低使用成本（不使用独立的主机也不影响现有工作环境）我建议在VMware或者VirtualBox的虚拟机中安装学习。不过，Kali Linux也提供了廉价的树莓派这种ARM环境运行的发行版，特别是针对廉价的树莓派Zero也提供了支持。

> 在淘宝上，树莓派Zero只需要60元人民币，加上一个USB外壳，可以组成精巧而Geek范的移动计算设备。
>
> 我个人学习使用Kali Linux是采用[在树莓派Zero W上运行Kali Linux](../../../develop/raspberry_pi/running_kali_linux_on_raspberry_pi_zero_w)，非常有趣的体验。

## 图形桌面

Kali Linux现在的发行版提供了多种图形桌面环境，从强大的Gnome到轻量级的Xfce，几乎和常用的Debian/Red Hat系列相差无几。

我个人感觉这样的特定发行版，应该追求专业用途，能够将性能发挥到极致才是目标。所以，不太追求图形界面完美，倾向于采用轻量级的桌面。或许，使用Xfce或者LXDE、Fluxbox较为合适。

> 我准备在树莓派Zero上尽量使用字符终端模式工作，仅有少部分GUI工作，准备采用远程的X window桌面来实现。这样，我可以在macOS笔记本远程访问插在USB接口上的树莓派Zero系统中运行的Kali Linux。

> 我甚至在想，对于Kali Linux，也许最佳方式是通过字符终端结合在Kali Linux上运行WEB服务器来实现远程图形界面。类似将Kali Linux作为服务器来运行。通过定制融合了服务的Kali Linux来实现一种安全发行的Linux服务器。

* [定制Kali Linux桌面fluxbox窗口管理器](customise_kali_linux_fluxbox_window_manager): 当前我所采用的窗口管理器，非常轻量级，但是使用便捷性和软件兼容性上和Xfce有较大差距
* [定制Kali Linux桌面i3窗口管理器](customise_kali_linux_i3_window_manager)：曾经尝试使用，但是在VNC环境下使用存在一些问题，没有解决好


