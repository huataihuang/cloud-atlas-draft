在KVM中，你可以从一台主机迁移一个KVM虚拟机到另外一台主机而无须宕机。如果两个KVM物理服务器访问共享的存储池，KVM在线迁移可以完美运行。要在两个KVM主机上访问共享的存储池，你需要使用NFS或者GFS2文件系统（集群文件系统）。在这个案例中，我使用NFS文件系统来存储VM镜像。在迁移过程中，VM的"内存"内容将复制到目标KVM物理主机，并且在某个时间点相同内容时切换来迁移VM。注意，当在KVM主机间使用共享文件系统，VM的磁盘镜像不在通过网络复制，这样两个KVM物理主机将访问相同的存储池。

![KVM热迁移](/img/virtual/kvm/startup/KVM-Live-VM-Migration.jpg)

# 环境

* KVM物理主机 – UA-HA 和 UA-HA2
* VM名字 – UAKVM2

存储池：

```
[root@UA-HA ~]# df -h /kvmpool/
Filesystem                 Size  Used Avail Use% Mounted on
192.168.203.134:/kvmstore  1.8G  1.7G   88M  96% /kvmpool
[root@UA-HA ~]# ssh UA-HA2 df -h /kvmpool/
Filesystem                 Size  Used Avail Use% Mounted on
192.168.203.134:/kvmstore  1.8G  1.7G   88M  96% /kvmpool
[root@UA-HA ~]# ls -lrt /kvmpool
total 1710924
-rw------- 1 root root 4295884800 Dec 22 18:07 UAKVM2.qcow2
[root@UA-HA ~]#
```

> 你必须在KVM主机之间配置`无须密码的root登录ssh`来立即启动迁移以避免root用户密码提示。

* 当

# 参考

* [Perform Live Migration on Linux KVM – Part 11](http://www.unixarena.com/2015/12/perform-live-migration-on-linux-kvm.html)