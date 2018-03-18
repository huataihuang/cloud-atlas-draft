[MAAS](https://maas.io)即Metal as a Service，是Ubuntu开发的完全自动化物理服务器管理系统。在这个基础上可以实现云计算部署。

我的目标是对比各种BareMetal平台，实现海量服务器的自动管理。

# 对比

开源体系中有相似功能的平台可以对比研究：

* FAI (Fully Automatic Installation)
* Cobbler - Red Hat体系的服务器自动安装系统，基于KickStart
* Spackwalk - Red Hat商用软件Satellite的上游开源软件
* Foreman - 集成了Puppet的开源DevOps平台，也有部分功能

* Crowbar - 可以将bare-metal自动转换成OpenStack云计算平台，并且支持Ceph，高可用，以及自动安装

> [T420s/ X220 UEFI PXE boot](https://forums.lenovo.com/t5/Enterprise-Client-Management/T420s-X220-UEFI-PXE-boot/td-p/1301705)介绍了联想笔记本X220通过PXE启动的方法，准备用来实践一个自动部署系统。
>
> [Enabling PXE Boot for Lenovo ThinkPad](https://www.itecs.ncsu.edu/helpdesk/kb/enabling-pxe-boot-for-lenovo-thinkpad/)介绍了PXE启动方法：

* Boot up the computer.
* Press F2 -> press Enter -> press F1.
* This should take you to the BIOS screen. Select Security -> select Secure Boot -> set to Disable -> select Start Up -> select UEFI/Legacy Boot -> set to Legacy Only -> press F10.
* Once you press F10, reboot then press F12.
* You should now be at the boot menu. Select PCI LAN.
* Press Enter.
* This should bring up a screen with the Intel Network Boot Agent. Simultaneously press Function and P (on some Lenovo ThinkPad models, this will be the same as pressing Pause|Break).
* Press Enter.
* This should go to failure, then go to the boot menu.

# 参考

* [Top 6 Open Source Linux Server Provisioning Software](https://www.cyberciti.biz/tips/server-provisioning-software.html)