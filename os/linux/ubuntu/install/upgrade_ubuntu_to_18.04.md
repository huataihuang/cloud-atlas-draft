2018年4月，Ubuntu推出了长期稳定版本18.04 LTS Bionic Beaver，并且之后提供了从 16.04 和 17.10 版本升级的无痛方法。本文即为从 Ubuntu 16.04 LTS 升级的实践记录。

* 首先将当前系统升级到主版本的最新状态，确保软件包之间差距最小化

```
sudo apt update 
sudo apt upgrade
sudo apt dist-upgrade
```

* 然后删除不需要的软件包

```
sudo apt autoremove
```

* 安装升级工具

```
sudo apt install update-manager-core
```

* 执行升级

```
sudo do-release-upgrade
```

通过ssh远程执行升级的话，系统会提示风险，并提供一个辅助的再其他端口启用的ssh：

```
Continue running under SSH?

This session appears to be running under ssh. It is not recommended
to perform a upgrade over ssh currently because in case of failure it
is harder to recover.

If you continue, an additional ssh daemon will be started at port
'1022'.
Do you want to continue?

Continue [yN]
```

并提示开启其他防火墙端口

```
Starting additional sshd

To make recovery in case of failure easier, an additional sshd will
be started on port '1022'. If anything goes wrong with the running
ssh you can still connect to the additional one.
If you run a firewall, you may need to temporarily open this port. As
this is potentially dangerous it's not done automatically. You can
open the port with e.g.:
'iptables -I INPUT -p tcp --dport 1022 -j ACCEPT'

To continue please press [ENTER]
```

> 建议开启screen来实现升级，避免升级过程中网络断开影响。不过，我的升级实践非常顺利

升级完成后检查版本：

```
lsb_release -a
```

显示输出

```
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 18.04.1 LTS
Release:	18.04
Codename:	bionic
```

# 参考

* [How To Upgrade Ubuntu To 18.04 LTS Bionic Beaver ](https://linuxconfig.org/how-to-upgrade-to-ubuntu-18-04-lts-bionic-beaver)