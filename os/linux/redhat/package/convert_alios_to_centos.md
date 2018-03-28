> 本文提供给需要将AliOS（类似CentOS的给予RHEL的发行版本）转换到标准社区CentOS的人做参考

# 转换到CentOS 7.4

```
rpm -e --nodeps alios-release-server-7.2-9.alios7.x86_6
rpm --import http://mirrors.163.com/centos/7.4.1708/os/x86_64/RPM-GPG-KEY-CentOS-7
rpm -ivh http://mirrors.163.com/centos/7.4.1708/os/x86_64/Packages/centos-release-7-4.1708.el7.centos.x86_64.rpm
```

部分软件包版本号有冲突(AliOS采用了更高的版本编号)，需要做降级：

```
yum downgrade systemd-libs-219-42.el7_4.10 systemd-219-42.el7_4.10 systemd-sysv-219-42.el7_4.10

yum downgrade libgpg-error-1.12-3.el7 \
bzip2-libs-1.0.6-13.el7 bzip2-1.0.6-13.el7 \
libattr-2.4.46-12.el7 attr-2.4.46-12.el7 \
cracklib-2.9.0-11.el7 cracklib-dicts-2.9.0-11.el7 \
libcap-ng-0.7.5-4.el7
```

## 如何降级软件包

要找到如何降级版本，基本方法就是：当`yum upgrade`报错某些软件包冲突，就通过`rpm -qa | grep XXXX`找到有哪些相关包，例如：

```
#rpm -qa | grep systemd
systemd-219-42.4.alios7.x86_64
systemd-sysv-219-42.4.alios7.x86_64
systemd-libs-219-42.4.alios7.x86_64
```

而在`yum upgrade`时候提示：

```
Error: Package: systemd-219-42.4.alios7.x86_64 (@alios.7u2.base.x86_64)
           Requires: systemd-libs = 219-42.4.alios7
           Removing: systemd-libs-219-42.4.alios7.x86_64 (@alios.7u2.base.x86_64)
               systemd-libs = 219-42.4.alios7
           Downgraded By: systemd-libs-219-42.el7_4.10.x86_64 (updates)
               systemd-libs = 219-42.el7_4.10
......
```

就说明需要从版本`219-42.4.alios7`降级到`219-42.el7_4.10`，对应相关的软件包`systemd`和`systemd-libs`等都要同时降级，所以执行命令：

```
yum downgrade systemd-libs-219-42.el7_4.10 systemd-219-42.el7_4.10 systemd-sysv-219-42.el7_4.10
```