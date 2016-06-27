默认配置的`ext4`文件系统挂载参数`defaults`会影响写入性能，此时使用`mount`命令检查磁盘挂载可以看到

```
/dev/sda5 on /home type ext4 (rw)
```

* 增加`noatime`设置

修改 `/etc/fstab` 将

```bash
LABEL=/home   /home  ext4   defaults       0 0
```

修改成

```bash
LABEL=/home   /home  ext4   defaults,noatime       0 0
```

* 不需要重启操作系统，只需要使用如下命令`remount`就可以生效

```bash
mount -o remount /home
```

* 再次使用`mount`检查可以看到`noatime`参数已经生效

```bash
/dev/sda5 on /home type ext4 (rw,noatime)
```

# `relatime`

`relatime`参数适合一些需要在最新的`atime`更新时修改的文件或目录，例如`/var/spool`和`/tmp`，此时建议使用`defaults,relatime`挂载参数。对于Linux Kernel 2.6.30或更新版本，也就是Red Hat Enterprise Linux 6，默认挂载所有的文件系统都是`relatime`。

# 参考

* [Reducing Disk IO By Mounting Partitions With noatime](https://www.howtoforge.com/reducing-disk-io-by-mounting-partitions-with-noatime)
* [Gain 30% Linux Disk Performance with noatime, nodiratime, and relatime](https://lonesysadmin.net/2013/12/08/gain-30-linux-disk-performance-noatime-nodiratime-relatime/)