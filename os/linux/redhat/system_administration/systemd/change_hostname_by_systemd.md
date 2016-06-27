Red Hat Enterprise Linux/CentOS 7引入了systemd管理系统服务和配置后，原本对主机名修改的方法有了一些调整。

虽然依然可以使用`hostname`来动态调整主机名，并且将原先`/etc/sysconfig/network`配置文件中的`HOSTNAME=`配置调整到`/etc/hostname`就可以完成主机名修改的持久化。不过，使用标准的`systemd`系列工具来完成这个任务可以带来更为规范的效果并且也带来了更多扩展设置。

# `hostnamectl`工具

`hostnamectl`工具提供了控制Linux系统主机名的方法。

* 检查当前主机名

```bash
hostnamectl status
```

显示输出

```
   Static hostname: localhost.localdomain
         Icon name: computer-vm
           Chassis: vm
        Machine ID: d7309d2b99134bff9bee918ce27fe7de
           Boot ID: 925798581c1541c18bd256b30d0b0739
    Virtualization: kvm
  Operating System: CentOS Linux 7 (Core)
       CPE OS Name: cpe:/o:centos:centos:7
            Kernel: Linux 3.10.0-327.22.2.el7.x86_64
      Architecture: x86-64
```

* 修改主机名为`devstack`

```bash
hostnamectl set-hostname devstack
```

此时再查看`hostname`命令则显示输出为`devstack`，并且上述修改也是持久化的修改，可以看到`/etc/hostname`内容被修改成`devstack`。

> 和以往传统的`hostname devstack`只修改当前动态主机名，不持久化配置不同，`hostnamectl set-hostname`默认（没有使用参数时）是同时修改动态的主机名和持久化保存配置的，避免了系统管理员疏忽忘记持久化配置。

* `hostnamectl set-hostname`的2个参数：`--static`，`--pretty`

`pretty`主机名是指对主机名的一个详细的或者可读化的主机名，可以设置很长的描述。例如，同时把上述`devstack`主机名设置成`huatai's openstack lab`这个描述

```bash
hostnamectl set-hostname "huatai's openstack lab" --pretty
```

然后再使用`hostnamectl status`检查就会看到

```
   Static hostname: devstack
   Pretty hostname: huatai's openstack lab
         Icon name: computer-vm
           Chassis: vm
        Machine ID: d7309d2b99134bff9bee918ce27fe7de
           Boot ID: 925798581c1541c18bd256b30d0b0739
    Virtualization: kvm
  Operating System: CentOS Linux 7 (Core)
       CPE OS Name: cpe:/o:centos:centos:7
            Kernel: Linux 3.10.0-327.22.2.el7.x86_64
      Architecture: x86-64
```

# 删除主机名

可以使用以下命令清除掉主机名

```bash
hostnamectl set-hostname ""
hostnamectl set-hostname "" --static
hostnamectl set-hostname "" --pretty
```

# 远程修改主机名

`hostnamectl`还提供了远程修改主机名的方法

传统ssh方法修改`192.168.1.2`的主机名

```
ssh root@192.168.1.2 hostnamectl set-hostname server1
```

或者直接使用`hostnamectl`

```
hostnamectl set-hoatname server1 -H root@192.168.1.2
```

# 其他方法

Network Manager工具提供了通过交互界面`nmtui`或者命令行`nmcli`来修改主机名方法，具体参考[RHEL / Centos Linux 7: Change and Set Hostname Command](http://www.cyberciti.biz/faq/rhel-redhat-centos-7-change-hostname-command/)

# 参考

* [How to Change Hostname in RHEL / CentOS 7.0](http://linoxide.com/linux-command/change-hostname-in-rhel-centos-7/)
* [RHEL / Centos Linux 7: Change and Set Hostname Command](http://www.cyberciti.biz/faq/rhel-redhat-centos-7-change-hostname-command/)