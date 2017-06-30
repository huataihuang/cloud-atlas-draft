在测试服务器上遇到一个奇怪的问题，无法重命令/home目录

```
# mv /home /home_old
mv: cannot move ‘/home’ to ‘/home_old’: Device or resource busy
```

实际上使用`lsof`检查，`/home`目录并没有访问，但是有很多`selinux`相关的`file_contexts.homedirs.bin`

```
[root@dev7 /]# lsof | grep home
systemd      1         root  mem       REG              253,0     44725     326702 /etc/selinux/targeted/contexts/files/file_contexts.homedirs.bin
lvmetad    475         root  mem       REG              253,0     44725     326702 /etc/selinux/targeted/contexts/files/file_contexts.homedirs.bin
systemd-u  491         root  mem       REG              253,0     44725     326702 /etc/selinux/targeted/contexts/files/file_contexts.homedirs.bin
```

重启操作系统，确保没有用户在`/home`目录下，并且直接使用`root`用户身份去`mv /home /home_old`同样报错。

```
[root@dev7 /]# df -h
Filesystem               Size  Used Avail Use% Mounted on
/dev/mapper/centos-root  8.5G  3.6G  5.0G  42% /
devtmpfs                  16G     0   16G   0% /dev
tmpfs                     16G     0   16G   0% /dev/shm
tmpfs                     16G  8.4M   16G   1% /run
tmpfs                     16G     0   16G   0% /sys/fs/cgroup
/dev/vdb                 100G   33M  100G   1% /data
/dev/vda1                497M  309M  188M  63% /boot
tmpfs                    3.1G     0  3.1G   0% /run/user/0
```

确保没有`/home`目录的独立磁盘挂载。

怀疑是selinux不允许修改`/home`，所以尝试禁止`selinux`，修改`/etc/sysconfig/selinux`

```
#SELINUX=enforcing
SELINUX=disabled
```

不重启操作系统也可以直接关闭selinux

```
setenforce 0
```

我也尝试重启了操作系统，但是发现，虽然`lsof | grep home`已经不再出现 `selinux`相关的`file_contexts.homedirs.bin` ，但是在重命名 `/home` 目录依然报错

```
# mv /home /home_old
mv: cannot move ‘/home’ to ‘/home_old’: Device or resource busy
```

这个问题暂时么有找到解决方法。