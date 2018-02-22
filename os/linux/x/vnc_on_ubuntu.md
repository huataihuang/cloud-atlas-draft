在[安装XUbuntu](../ubuntu/install/install_xubuntu)提到了将Xubuntu桌面作为远程管理桌面的想法，这里我们来做一个实践。相关方法可以用于远程访问云计算的虚拟机中的Ubuntu桌面。

> VNC 也称为 "Virtual Network Computing"，是远程连接主机图形界面的一种方法，通常方便管理Linux桌面。为了安全，现在通常不会直接将VNC端口暴露在网络中，而是结合SSH tunnel使用，即先SSH到服务器上，通过SSH的端口转发方式访问主机`127.0.0.1`上开放的VNC端口避免外部攻击。

# 安装



# 参考

* [How to Install and Configure VNC on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-vnc-on-ubuntu-16-04)