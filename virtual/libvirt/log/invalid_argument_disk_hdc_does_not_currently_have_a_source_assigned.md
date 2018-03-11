

```
2018-03-08 16:42:22.768+0000| 39205| error | qemuDomainGetBlockInfo:12084 | invalid argument: disk hdc does not currently have a source assigned
2018-03-08 16:42:22.790+0000| 39208| error | qemuDomainGetBlockInfo:12084 | invalid argument: disk hdc does not currently have a source assigned
2018-03-08 16:42:22.812+0000| 39206| error | qemuDomainGetBlockInfo:12084 | invalid argument: disk hdc does not currently have a source assigned
2018-03-08 16:42:22.834+0000| 39207| error | qemuDomainGetBlockInfo:12084 | invalid argument: disk hdc does not currently have a source assigned
2018-03-08 16:42:22.856+0000| 39209| error | qemuDomainGetBlockInfo:12084 | invalid argument: disk hdc does not currently have a source assigned
```

```
#ps aux | grep 39204
root      2902  0.0  0.0  61168   796 pts/0    S+   17:07   0:00 grep 39204
root     39204  0.3  0.0 459332  5484 ?        Sl   Jan20 220:01 libvirtd --daemon --listen --switch 0 --update

#ps -T -p 39204
  PID  SPID TTY          TIME CMD
39204 39204 ?        02:30:44 libvirtd
39204 39205 ?        00:11:37 libvirtd
39204 39206 ?        00:11:36 libvirtd
39204 39207 ?        00:11:38 libvirtd
39204 39208 ?        00:11:39 libvirtd
39204 39209 ?        00:11:37 libvirtd
39204 39210 ?        00:02:11 libvirtd
39204 39211 ?        00:02:14 libvirtd
39204 39212 ?        00:02:14 libvirtd
39204 39213 ?        00:02:15 libvirtd
39204 39214 ?        00:02:11 libvirtd
```

可以观察到是同一时间启动的线程

```
39204 39205 ?        00:11:37 libvirtd
39204 39206 ?        00:11:36 libvirtd
39204 39207 ?        00:11:38 libvirtd
39204 39208 ?        00:11:39 libvirtd
39204 39209 ?        00:11:37 libvirtd
```

上述错误日志对应的是`libvirt`的CDROM设备`hdc`，可以看到`virsh dumpxml <dom>`输出中有

```xml
      <disk type='file' device='cdrom'>
        <driver name='qemu' type='raw'/>
        <target dev='hdc' bus='ide'/>
        <readonly/>
        <alias name='ide0-1-0'/>
        <address type='drive' controller='0' bus='1' target='0' unit='0'/>
      </disk>
```

所以是虚拟机中弹出了CD导致的问题，或者是检测不到某个iso？