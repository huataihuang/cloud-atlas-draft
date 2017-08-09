KVM服务器`/var/log/libvirt/libvirtd.log`日志记录：

```
2017-08-08 23:28:31.349+0000: 12210: warning : qemuDomainObjTaint:1807 : Domain id=69 name='webserver-1-101' uuid=9001a3e0-dbf9-464b-ada4-a632411c3a84 is tainted: high-privileges
2017-08-08 23:28:31.349+0000: 12210: warning : qemuDomainObjTaint:1807 : Domain id=69 name='webserver-1-101' uuid=9001a3e0-dbf9-464b-ada4-a632411c3a84 is tainted: host-cpu
2017-08-08 23:28:43.480+0000: 12208: warning : qemuDomainObjTaint:1807 : Domain id=69 name='webserver-1-101' uuid=9001a3e0-dbf9-464b-ada4-a632411c3a84 is tainted: custom-monitor
```

日志中`qemuDomainObjTaint`是什么含义？为何会提示虚拟机已经被污染（tainted）?

> 日志设置参考 [libvirt日志](libvirtd_log)

* `tainted: high-privileges` - 这里`tainted`污染的标签是因为使用了`root`用户身份来运行qemu-kvm进程导致的，正常情况下，`qemu-kvm`进程应该使用`qemu`用户来运行，而不是使用`root`身份。
* `tainted: host-cpu` - 这里`tainted`表示CPU被传递给VM。

> 在CentOS 7上运行的`qemu-kvm`进程采用`qemu`用户身份运行

```
#grep qemu /etc/group
kvm:x:36:qemu
qemu:x:107:
```

```
#grep qemu /etc/passwd
qemu:x:107:107:qemu user:/:/sbin/nologin
```

# 参考

* [Unknown warnings and errors in libvirt log](https://forums.lime-technology.com/topic/56606-unknown-warnings-and-errors-in-libvirt-log/)