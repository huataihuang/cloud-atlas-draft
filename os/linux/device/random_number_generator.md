# 为何需要`rng`和虚拟化`virtio-rng`？

在[KVM虚拟机中安装CentOS内核源代码](../redhat/package/install_centos_kernel_source)时，你会发现需要生成PGP密钥来给模块签名，此时系统会提示需要`rngd`需要读取`/dev/random`或`/dev/urandom`设备来生成密钥。如果`libvirtd`创建的虚拟机没有包含这个虚拟随机数生成器设备，会导致安装过程卡住长时间无法结束。

在KVM虚拟机中运行FreeBSD系统，启动虚拟机时，如果你仔细观察启动信息，会看到FreeBSD启动时提示`kernel: random device not loaded; using insecure entropy`。这也是因为KVM虚拟机没有提供虚拟随机数生成器导致的。

# 随机数生成器`rng`

为了能够生成安全的不被轻易破解的加密密钥，需要一个随机数源。通常，数字随机性越大，越能够得到更佳的唯一密钥。用于生成随机数的`熵`是通常从计算机环境"噪声"获得，或者使用硬件的随机数生成器。

`rngd`服务，是`rng-tools`软件包的部分，能够使用环境噪声和硬件随机数生成器来生成熵。这个服务检查是否有充分随机的随机性源来提供数据并存储它到内核的随机数熵池（random-number entropy pool）。这个随机数是通过`/dev/random`和`/dev/urandom`字符设备来生成的。

随机数生成器(Random Number Generator, RNG)是生成伪随机数的机制。伪随机数字可以用于生成SSH key，进程随机PID，TCP序列号以及UUID等。使用加密（文件系统，邮件等等）需要大量的伪随机数。

要允许应用程序获得伪随机数，至少有2个内核块设备：

* `/dev/urandom` 提供标准质量的随机数，不管是否有熵都可以工作：当需要大量的随机数的时候，随机性质量会下降（这是因为`/dev/urandom`设备是一个不中断源，会重用内核熵池，所以提供的是无限的伪随机数）。
* `/dev/random` 提供高质量随机数，但是缺乏熵的时候会停止工作：在Linux内核保留了一个4KB的熵池（entropy pool）（这个熵池的大小见`/proc/sys/kernel/random/poolsize`）；当这个pool空的时候，内核阻塞。

为了得到优质的伪随机数，需要一些`熵`（`entropy`）。这个`熵`是由操作系统搜集的随机性因素：

* 键盘实践，网络流量，鼠标移动，中断，ide计时等内部源
* 在Intel IvyBridge和Haswell处理器提供的`RDRAND`这种特定处理器指令
* 通过`virtio-rng`半虚拟化设备实现虚拟机随机设备（参考Red Hat文档[Access to Random Numbers Made Easy in RHEL7](http://rhelblog.redhat.com/2015/03/09/red-hat-enterprise-linux-virtual-machines-access-to-random-numbers-made-easy/)）
* 独立的、外部、物理设备（称为TPM，即Trusted Platform Module）

> 以下实践是为了在KVM虚拟机中[安装CentOS内核源代码](../../redhat/package/install_centos_kernel_source)，解决数字签名使用到的随机数生成问题，部署安装`rng`的实践

# 安装`rng-tools`包

以下命令安装`rng-tools`

```
yum install rng-tools
```

启动及检查`rngd`服务（CentOS 6）

```
service rngd start
service rngd status
```

启动及检查`rngd`服务（CentOS 7）

```
systemctl start rngd
systemctl status rngd
```

`rngd`也支持指定随机数设备输入（默认是`/dev/hwrandom`）

```
rngd --rng-device=/dev/hwrng
```

或者`-o`或`--random-device`指定选择内核随机数输出（默认是`/dev/random`）。

`rng-tools`阮籍包也包含了`rngtest`工具，可以用来检查数据的随机性，要检测`/dev/random`的输出随机性水平，可以使用`rngtest`工具如下

```
cat /dev/random | rngtest -c 1000
```

# 虚拟机中部署`rng`

这个`/sbin/rngd`属于软件包 `rng-tools` ，可以通过 `sudo yum install rng-tools`。但是在kvm虚拟机中执行：

```
sudo rngd -r /dev/hwrandom
```

提示错误

```
Unable to open file: /dev/tpm0
can't open any entropy source
Maybe RNG device modules are not loaded
```

尝试加载`sudo modprobe intel-rng`，但是提示错误

```
FATAL: Error inserting intel_rng (/lib/modules/2.6.32-696.el6.x86_64/kernel/drivers/char/hw_random/intel-rng.ko): No such device
```

尝试启动`rngd`服务，提示缺少`/dev/tpm0`设备文件

```
$ sudo /etc/init.d/rngd start
Starting rngd: Unable to open file: /dev/tpm0
can't open any entropy source
Maybe RNG device modules are not loaded
```

参考 [RHEL7: How to get started with random number generator.](https://www.certdepot.net/rhel7-get-started-random-number-generator/)

## CentOS 6 `rng`

对于虚拟机，需要使用`virtio-rng`设备

```
virsh shutdown centos6_vm
virsh edit centos6_vm
```

添加

```
   <rng model='virtio'>
     <rate bytes=’1024′ period=’1000’/>
     <backend model='random'>/dev/random</backend>
   </rng>
```

> 这里设置`<rate bytes=’1024′ period=’1000’/>`是为了防范guest虚拟机每秒消耗多于1KB的伪随机数。否则，一个guest虚拟机有可能会消耗掉所有的可用伪随机数，而其他虚拟机则无法分享。

然后再次启动

```
virsh start centos6_vm
```

重启虚拟机后设置`rngd`启动

```
service rngd start
chkconfig rngd on
```

检查内核模块可以看到系统加载了`virtio_rng`

```
lsmod | grep rng
```

* 然后创建一个伪随机设备

```
sudo rngd -r /dev/urandom
```

> CentOS6虚拟机启动`rngd`后进程会`D`住，堆栈显示

```
[<ffffffffa0172204>] virtio_data_present+0x24/0x50 [virtio_rng]
[<ffffffff813621d5>] rng_dev_read+0x85/0x1b0
[<ffffffff8119a455>] vfs_read+0xb5/0x1a0
[<ffffffff8119a7a1>] sys_read+0x51/0xb0
[<ffffffff8100b0d2>] system_call_fastpath+0x16/0x1b
[<ffffffffffffffff>] 0xffffffffffffffff
```

参考后文的"CentOS 7 `rng`"部分和[how to increase entropy in Centos 6.2?](https://www.centos.org/forums/viewtopic.php?t=1966)，修改`rngd`使用的设备配置，即编辑`/etc/sysconfig/rngd`，设置

```
EXTRAOPTIONS="-r /dev/urandom"
```

然后就可以启动CentOS 6虚拟机的`rngd`服务

```
service rngd start
```

## CentOS 7 `rng`

同样，对于虚拟机，需要先增加`virtio_rng`设备


```
virsh shutdown centos7_vm
virsh edit centos7_vm
```

添加

```
   <rng model='virtio'>
     <rate bytes=’1024′ period=’1000’/>
     <backend model='random'>/dev/random</backend>
   </rng>
```

然后再次启动，发现启动后`centos7_vm`内部的`rngd`进程也是D住的

```
$ ps aux | grep rng
root       523  0.0  0.0      0     0 ?        D    11:17   0:00 [hwrng]
root       635  0.0  0.0   4368   584 ?        Ds   11:17   0:00 /sbin/rngd -f
```

检查服务启动日志

```
$ systemctl status rngd -l
● rngd.service - Hardware RNG Entropy Gatherer Daemon
   Loaded: loaded (/usr/lib/systemd/system/rngd.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2017-04-14 11:17:56 CST; 2min 21s ago
 Main PID: 635 (rngd)
   CGroup: /system.slice/rngd.service
           └─635 /sbin/rngd -f

Apr 14 11:17:56 dev7 systemd[1]: Started Hardware RNG Entropy Gatherer Daemon.
Apr 14 11:17:56 dev7 systemd[1]: Starting Hardware RNG Entropy Gatherer Daemon.
```

检查了虚拟机内部，已经生成了`/dev/random`和`/dev/urandom`设备

```
$ ls -lh /dev/random
crw-rw-rw-. 1 root root 1, 8 Apr 14 11:17 /dev/random

$ ls -lh /dev/urandom
crw-rw-rw-. 1 root root 1, 9 Apr 14 11:17 /dev/urandom
```

* 检查rng

```
# systemctl stop rngd
# rngd -v
Available entropy sources:
	Intel/AMD hardware rng
```

> 这里需要先停止`rngd`然后才能使用`rngd -v`检查，否则会卡住

* 在KVM物理服务器，可以使用如下命令检查有哪些虚拟机使用了`virt-rng`设备

```
lsof /dev/random | grep qemu-kvm | awk '{print $2;}' | xargs ps -c | awk '{print $9;}'
```

* 再次CentOS 7 虚拟机，发现重启后 `rngd`服务启动失败

```
● rngd.service - Hardware RNG Entropy Gatherer Daemon
   Loaded: loaded (/usr/lib/systemd/system/rngd.service; enabled; vendor preset: enabled)
   Active: failed (Result: exit-code) since Fri 2017-04-14 11:32:01 CST; 3min 47s ago
  Process: 641 ExecStart=/sbin/rngd -f (code=exited, status=1/FAILURE)
 Main PID: 641 (code=exited, status=1/FAILURE)

Apr 14 11:32:01 dev7 systemd[1]: Started Hardware RNG Entropy Gatherer Daemon.
Apr 14 11:32:01 dev7 systemd[1]: Starting Hardware RNG Entropy Gatherer Daemon...
Apr 14 11:32:01 dev7 rngd[641]: Unable to open file: /dev/tpm0
Apr 14 11:32:01 dev7 rngd[641]: can't open any entropy source
Apr 14 11:32:01 dev7 rngd[641]: Maybe RNG device modules are not loaded
Apr 14 11:32:01 dev7 systemd[1]: rngd.service: main process exited, code=exited, status=1/FAILURE
Apr 14 11:32:01 dev7 systemd[1]: Unit rngd.service entered failed state.
Apr 14 11:32:01 dev7 systemd[1]: rngd.service failed.
```

这是因为默认使用的`/dev/tpm0`设备不存在。需要修改配置让`rngd`不要使用硬件熵源：

```
cp /usr/lib/systemd/system/rngd.service /etc/systemd/system
```

修改`/etc/systemd/system/rngd.service`，替换

```
ExecStart=/sbin/rngd -f -r /dev/urandom
```

然后重新加载`systemd`

```
systemctl daemon-reload
```

再次启动`rngd`

```
systemctl restart rngd
```

然后检查就可以看到`rngd`服务工作正常

# `haveged`服务

[HAVEGE](http://www.irisa.fr/caps/projects/hipsor/)是一个从内部CPU硬件状态（缓存，分支预测因子，TLBs）作为不确定根源的随机数生成器。可以作为`rgnd`的替代。这个软件包是通过EPEL仓库提供

```
yum install epel-release
yum install haveged
```

# 测试

要了解熵池的补充数度有多快，可以使用如下命令

```
watch -n 1 cat /proc/sys/kernel/random/entropy_avail
```

> 注意：由于4KB的熵池限制，你不能获得大于4095的值。

测试当前熵池源的质量，使用命令：

```
cat /dev/random | rngtest -c 1000
```

# 虚拟机内部使用`rngd`经验小结

* 通过`virsh edit VM`编辑KVM虚拟机的配置，增加

```
   <rng model='virtio'>
     <backend model='random'>/dev/random</backend>
   </rng>
```

* 虚拟机重启后会在虚拟机内部增加`/dev/random`和`/dev/urandom`两个设备
* 需要配置`rngd`服务启动参数，增加`-r /dev/urandom`，否则会导致`rngd`进程启动后D住
  * CentOS 6 修改`/etc/sysconfig/rngd`设置参数`EXTRAOPTIONS="-r /dev/urandom"`
  * CentOS 7 复制配置文件`cp /usr/lib/systemd/system/rngd.service /etc/systemd/system`，并修改`ExecStart=/sbin/rngd -f -r /dev/urandom`

# 参考

* [RHEL7: How to get started with random number generator](https://www.certdepot.net/rhel7-get-started-random-number-generator/)
* [how to increase entropy in Centos 6.2?](https://www.centos.org/forums/viewtopic.php?t=1966)
* [3.4. Using the Random Number Generator](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Security_Guide/sect-Security_Guide-Encryption-Using_the_Random_Number_Generator.html)
* [RHEL 6 on VMware /dev/random entropy issue](https://access.redhat.com/discussions/1203273)
* [How to fix the entropy pool issue with RHEL 5.x](https://serverfault.com/questions/303935/how-to-fix-the-entropy-pool-issue-with-rhel-5-x)