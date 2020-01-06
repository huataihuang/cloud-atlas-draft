> 在[libvirtd日志报错virCgroupSetValueStr"No space left on device"](../../../os/linux/kernel/cgroups/rhel7/libvirt_cgroup_no_space_left_on_device)排查中，需要找到为何出现无法建立slice控制组，以及对这个slice的作用的影响调查，准备debug程序代码。

* 按照[libvirtd日志](../log/libvirtd_log)设置`/etc/libvirt/libvirtd.conf`

```ini
log_level = 1
log_filters="3:virobject 3:virfile 2:virnetlink 1:cgroup 3:event 3:json 1:libvirt 1:util 1:qemu"
log_outputs="1:file:/var/log/libvirt/libvirtd.log"
```

