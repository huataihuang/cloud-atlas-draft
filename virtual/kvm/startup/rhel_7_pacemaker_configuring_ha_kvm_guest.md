如果你完整跟随UnixArena的KVM系列文章，你可能已经读过[十一：实现Linux KVM在线迁移](perform_live_migration_on_linux_kvm)。KVM支持Guest Linux热迁移（类似VMware vMotion）但是并没有提供高可用，你需要一个集群设置。（类似VMware HA）。在本文中，我们将配置KVM guest作为支撑热迁移到集群资源。如果你能够手工迁移KVM guest资源，集群可以在任何硬件故障或hypervisor失效时执行这个动态迁移，guest将在集群的可用节点启动（在最小化的宕机时间内）。以下将使用现有的KVM和redhat cluster配置来完成此项测试。

* KVM Hyper-visor – RHEL 7.2
* Redhat cluster Nodes – UA-HA & UA-HA2
* Shared storage – NFS   (As a alternative , you can also use GFS2 )
* KVM guest – UAKVM2

![使用pacemaker构建KVM高可用guest](/img/virtual/kvm/startup/HA-KVM-guest-using-Pacemaker.jpg)

* 登录到集群某个节点，关闭KVM guest

```
[root@UA-HA ~]# virsh shutdown UAKVM2
[root@UA-HA ~]# virsh list --all
 Id    Name                           State
----------------------------------------------------
 -     UAKVM2                         shut off

[root@UA-HA ~]#
```

* 复制Guest domain配置文件（XML）到NFS路径下

```
[root@UA-HA qemu_config]# cd /etc/libvirt/qemu/
[root@UA-HA qemu]# ls -lrt
total 8
drwx------. 3 root root   40 Dec 14 09:13 networks
drwxr-xr-x. 2 root root    6 Dec 16 16:16 autostart
-rw-------  1 root root 3676 Dec 23 02:52 UAKVM2.xml
[root@UA-HA qemu]#
[root@UA-HA qemu]# cp UAKVM2.xml /kvmpool/qemu_config
[root@UA-HA qemu]# ls -lrt /kvmpool/qemu_config
total 4
-rw------- 1 root root 3676 Dec 23 08:14 UAKVM2.xml
[root@UA-HA qemu]#
```

* 