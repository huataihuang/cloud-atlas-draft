# 获取core dump

在实现了[libvirt pvpanic](libvirt_pvpanic)之后，虚拟机触发crash就可以在物理主机上获取到虚拟机内存core dump，例如，在虚拟机内部执行如下命令获取虚拟机内存core dump

```
[root@test-coredump ~]# date;echo c > /proc/sysrq-trigger
Thu May 17 22:45:12 CST 2018
```

注意：在没有完成core dump之前，虚拟机无法启动，虚拟机处于crashed状态。需要等core dump完成后，libvirtd才会再次启动虚拟机。在这个过程中，虚拟机始终是处于`crashed`状态

[root@virt-hostserver:/corefile]
#virsh list | grep test-coredump
 132   test-coredump crashed

此时host主机上有一个`libvirt_iohelper`负责完成core dump

```
root      47056 29.0  0.0  44040  2184 ?        D    22:27   1:53 /usr/libexec/libvirt_iohelper /apsara/kvm/corefile/test-coredump-2018-05-17-22:27:20 0 0 1
```

测试64G内存虚拟机，从crash开始到完成core dump文件生成，大约需要6分钟左右时间。

# core dump带来的时间偏移

注意，当vm内部出现crash时，`libvirtd`会pause住虚拟机，并进行qemu虚拟机内存的core dump。但是，由于虚拟机内部无法获知虚拟机被冻结，所以当libvirtd完成core dump并启动虚拟机后，你会发现虚拟机的时钟出现了偏移。偏移的时间量就是虚拟机被冻结完成core dump的时间。

即，如果完成core dump的时间是6分钟（虚拟机被冻结6分钟），启动后检查虚拟机内部时钟，就会发现虚拟机时间慢了6分钟。

这个时间差异是因为底层kvm时钟的差异，实际上只要qemu进程不重启，则这个虚拟硬件时钟会始终偏差。不管虚拟机内部如何重启，或者crash后重启，这个时钟差异时钟保持。

即使虚拟机内部启动了ntpd服务，但是ntpd服务对于时钟偏差较大的情况，是不能自动完成时间矫正的。例如，以下在CentOS 7平台上检查，可以看到虚拟机中随着操作系统启动同时启动了`ntpd`。但是，该虚拟机连续测试了3次crash触发，每次core dump花费6分钟时间，此时可以看到虚拟机时钟比正确的时间慢了大约18分钟。

> 在CentOS 7上启用和维护NTP服务非常重要，请参考 [How To Synchronize Time in Linux with NTP Peers](https://www.rootusers.com/how-to-synchronize-time-in-linux-with-ntp-peers/)

## 解决core dump带来的时间偏移

在CentOS 7系统中，主要有两种NTP服务程序，Chrony 和 ntpd 。

* 使用`chrony`时间服务器

chronyd目前比较主流和推荐使用，据说比ntpd更适合间歇性不能连接公网NTP服务矫正时间的情况。

如果使用了chronyd，和systemd结合起来，可使用`timedatectl`来矫正时间偏差：

```
timedatectl set-ntp 1
timedatectl
```

此时可以看到

```
     NTP enabled: yes
     NTP synchronized: yes
```

* 使用ntpd时间服务器

当`ntpd`没有启动时，可以简单使用`ntpupdate pool.ntp.org`来根据internet上的时间服务器矫正本地时间。但是，如果`ntpd`已经启动，则由于socket被占用，则无法使用`ntpupdate`命令修正：

```
# ntpdate pool.ntp.org
17 May 23:27:49 ntpdate[1234]: the NTP socket is in use, exiting
```

解决方法是在操作系统启动ntpd之前，先使用`ntpdate`命令矫正一次时间。这需要使用到systemd已经定制好的`ntpdate.service`服务：

```
[Unit]
Description=Set time via NTP
After=syslog.target network.target nss-lookup.target
Before=time-sync.target
Wants=time-sync.target

[Service]
Type=oneshot
ExecStart=/usr/libexec/ntpdate-wrapper
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

我们只需要激活这个服务就可以

```
systemctl enable ntpdate.service
```

此时显示服务激活：

```
Created symlink from /etc/systemd/system/multi-user.target.wants/ntpdate.service to /usr/lib/systemd/system/ntpdate.service.
```

由于systemd会在启动ntpd之前，先调用`ntpdate`进行一次时钟同步，这就解决了pvpanic之后，libvirtd为了实现core dump而paused住虚拟机带来的时钟偏移。

以下可以看到core dump后虚拟机自动启动，此时hwclock时间是偏移的，但是系统时间得到了`ntpdate`矫正

```bash
[root@test-coredump ~]# systemctl status ntpdate
● ntpdate.service - Set time via NTP
   Loaded: loaded (/usr/lib/systemd/system/ntpdate.service; enabled; vendor preset: disabled)
   Active: active (exited) since Fri 2018-05-18 00:06:37 CST; 1min 13s ago
 Main PID: 955 (code=exited, status=0/SUCCESS)
   CGroup: /system.slice/ntpdate.service

May 17 23:37:54 test-coredump systemd[1]: Starting Set time via NTP...
May 18 00:06:37 test-coredump systemd[1]: Started Set time via NTP.
[root@test-coredump ~]# hwclock
daThu 17 May 2018 11:40:36 PM CST  -0.785167 seconds
[root@test-coredump ~]# date
Fri May 18 00:09:15 CST 2018
```

> 注意：在Red Hat Enterprise 7中，当系统时间通过NTP(Network Time Protocol)或者PTP（Precision Time Protocol）同步之后，内核会每`11`分钟自动矫正硬件时钟。
>
> 如果要自己控制硬件时钟同步，例如在ntpdate更新时间之后立即同步硬件时钟，可以参考[How to configure NTP client to sync with NTP server during system startup (boot) in (RHEL 7 / CentOS 7) Linux ](https://www.golinuxhub.com/2018/02/how-to-configure-ntp-client-to-sync.html)一文中提供的脚本

## 新的问题：`ntpdate`是否可以确保在应用服务启动前启动？

虽然通过启用`ntpdate`服务可以在`ntpd`启动前快速矫正虚拟机时间，但是也存在一个潜在风险：如果用户的应用先于`ntpdate`运行，在应用运行时，如果系统时间跳跃式变化可能会导致应用异常。

`ntpdate`能够在所有关键应用服务启动前启动？这涉及到对`systemd`服务启动顺序的设置

# 参考

* [How to configure NTP client to sync with NTP server during system startup (boot) in (RHEL 7 / CentOS 7) Linux ](https://www.golinuxhub.com/2018/02/how-to-configure-ntp-client-to-sync.html)
