XEN虚拟机热迁移失败，xend.log日志显示 `xc_save 81 880 0 0 40960 5 failed status 256`

```
[2017-09-07 11:10:38,238 1771 1431210304] INFO (XendDomainInfo:3212) Refresh vport cmd:/usr/sbin/vswctl refresh_vport_relay_route -p cp.0021e9 -d 192.168.1.192.
[2017-09-07 11:10:38,803 1771 1431210304] INFO (XendDomainInfo:3212) Refresh vport cmd:/usr/sbin/vswctl refresh_vport_relay_route -p cp.0023d8-I -d 192.168.1.192.
[2017-09-07 11:10:39,284 1771 1431210304] DEBUG (XendCheckpoint:250) [xc_save]: /usr/lib64/xen/bin/xc_save 81 880 0 0 40960 5
[2017-09-07 11:10:39,288 1771 1431210304] INFO (XendCheckpoint:287) Live migrate timeout value 1200, vm memory:524288
[2017-09-07 11:10:39,324 1771 1431210304] DEBUG (XendCheckpoint:681) forkHelper cmd:['/usr/lib64/xen/bin/xc_save', '81', '880', '0', '0', '40960', '5'] pid:8736
[2017-09-07 11:10:39,331 1771 1431210304] DEBUG (XendCheckpoint:708) Thread-888
[2017-09-07 11:10:39,384 1771 1280141632] INFO (XendCheckpoint:764) Thread-888:xc_save: failed to get the suspend evtchn port
[2017-09-07 11:10:39,386 1771 1280141632] INFO (XendCheckpoint:764) Thread-888:
[2017-09-07 11:10:39,945 1771 1280141632] INFO (XendCheckpoint:764) Thread-888:Saving memory pages: iter 1   0%rate limit: 320 mbit/s burst budget 102400 slot time 2441
[2017-09-07 11:11:16,690 1771 1280141632] INFO (XendCheckpoint:764) Thread-888:ERROR Internal error: Error when writing to state file (4a) (errno 104)
[2017-09-07 11:11:16,772 1771 1280141632] INFO (XendCheckpoint:764) Thread-888:Save exit rc=1
[2017-09-07 11:11:16,776 1771 1431210304] DEBUG (XendCheckpoint:750) /usr/lib64/xen/bin/xc_save 81 880 0 0 40960 5 failed status 256
[2017-09-07 11:11:16,777 1771 1431210304] ERROR (XendCheckpoint:361) Save failed on domain example-vm.903454.6332 (880) - resuming.
Traceback (most recent call last):
  File "/usr/lib64/python2.4/site-packages/xen/xend/XendCheckpoint.py", line 289, in _save
    forkHelper(cmd, fd, saveInputHandler, False,timeout)
  File "/usr/lib64/python2.4/site-packages/xen/xend/XendCheckpoint.py", line 747, in forkHelper
    raise XendError("%s failed status %d " % (string.join(cmd), status))
XendError: /usr/lib64/xen/bin/xc_save 81 880 0 0 40960 5 failed status 256
[2017-09-07 11:11:16,785 1771 1431210304] DEBUG (XendDomainInfo:4158) XendDomainInfo.resumeDomain(880)
[2017-09-07 11:11:17,614 1771 1431210304] INFO (XendDomainInfo:3227) Flush vport cmd:/usr/sbin/vswctl flush_vport_relay_route -p cp.0021e9.
[2017-09-07 11:11:18,176 1771 1431210304] INFO (XendDomainInfo:3227) Flush vport cmd:/usr/sbin/vswctl flush_vport_relay_route -p cp.0023d8-I.
[2017-09-07 11:11:18,641 1771 1431210304] INFO (XendCheckpoint:119) Send VM migrating resumed signal: /usr/lib64/xen/bin/xc_save 81 880 0 0 40960 5 failed status 256
```

> `/usr/lib64/xen/bin/xc_save 81 880 0 0 40960 5` 指令中 `880` 是虚拟机的domU id

检查虚拟机

```
#sudo xm list | grep example-vm
example-vm.903454.6332                    880   512     1     -b---- 464451.2
```