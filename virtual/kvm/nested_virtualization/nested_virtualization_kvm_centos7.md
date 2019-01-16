在Ubuntu操作系统实现nested virtualization，实现在虚拟机内部的虚拟化，可以帮助我们构建复杂的OpenStack集群。KVM支持虚拟化嵌套（Nested Virtualization），这样可以在KVM中运行KVM。

不过，目前我在测试环境中测试嵌套虚拟化nested virtualization，和普通的单层虚拟化虚拟机相比：默认安装配置的嵌套虚拟化的计算性能会下降20%以上，存储性能会下降50%以上，所以不适合生产环境，仅适合没有繁重压力的测试，作为大规模集群功能验证的测试环境。

此外，性能测试可以看到，默认发行版的kvm虚拟化损耗很大，需要在实践中做仔细的分析和测试以及优化，否则会影响生产。

> Ubuntu中使用KVM技术参考[Ubuntu环境KVM: 安装](../kvm_on_ubuntu/installation)

默认情况下，Linux发行版的内核没有激活嵌套虚拟化:

```
cat /sys/module/kvm_intel/parameters/nested
```

显示输出默认是`N`

* 通过重新加载KVM intel内核模块，可以激活嵌套虚拟化（nested virtualization）:

```
sudo rmmod kvm-intel
sudo sh -c "echo 'options kvm-intel nested=y' >> /etc/modprobe.d/kvm_intel.conf"
sudo modprobe kvm-intel
```

> `nested=y` 也可以写成 `nested=1`
>
> 注意：KVM intel模块的名字是`kvm_intel`，但是在内核模块参数中的关键字是 `kvm-intel`，并且加载时候也使用关键字 `kvm-intel`

* 检查嵌套虚拟化是否激活：

```
modinfo kvm_intel | grep nested
```

输出显示

```
parm:           nested:bool
```

# level 1 虚拟机

## 安装虚拟机

* 首先在host主机上安装kvm支持软件（包括libvirt）

```
sudo yum install libvirt virt-install qemu-kvm
```

* 通过串口模式安装level 1虚拟机（服务器越简单越有效安全），这个虚拟机是将要提供虚拟化功能，实现host主机hypervisor功能的虚拟机

这里我们使用CentOS 7来实验。我们的物理主机是`i5-4260U`处理器，有2核4HT并且有8G内存，所以level 1系统分配 `2c4g` 虚拟机，并且分配8G磁盘空间。

```
virt-install \
  --network bridge:virbr0 \
  --name centos7 \
  --ram=4096 \
  --vcpus=2 \
  --disk path=/var/lib/libvirt/images/centos7.qcow2,format=qcow2,bus=virtio,cache=none,size=16 \
  --graphics none \
  --location=http://mirrors.163.com/centos/7/os/x86_64/ \
  --extra-args="console=tty0 console=ttyS0,115200"
```

> 安装选择了 `btrfs` 作为文件系统，主要考虑各分区能够共享卷空间，避免LVM划分卷大小预估不准确合理。目前测试最小化安装centos 7+KVM组件占用空间 1.3G ，默认在8G磁盘上划分了800M的swap空间，默认又预留了1G的/boot磁盘空间，所以实际大约只有4.4G可用空间。
>
> 后续安装nested linux虚拟机可能磁盘空间不足，所以也可以在线修改虚拟机的存储空间。

> 192.168.123.18

* 启动虚拟机，再虚拟机内部检查是否具备KVM能力：即检查是否有`/dev/kvm`字符设备

```
ls -lh /dev/kvm
```

如果在虚拟机内部没有看到上述`kvm`设备，需要检查启动时候传递给qemu的参数。参考[Nested Guests](http://www.linux-kvm.org/page/Nested_Guests)，传递参数应该是

```
-cpu Haswell-noTSX-IBRS,vmx=on
```

不过，我没有找到传递方法，参考 [Red Hat手册 Nested Virtualization: Setup](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/sect-nested_virt_setup)

所以修改虚拟机的`.xml`配置：（假设虚拟机名字是`fedora28`）

```
virsh edit centos7
```

将

```xml
  <cpu mode='custom' match='exact' check='partial'>
    <model fallback='allow'>Haswell-noTSX-IBRS</model>
  </cpu>
```

修改成

```xml
<cpu mode='host-passthrough'/>
```

然后退出保存，再次重启虚拟机。

* 登陆虚拟机，检查虚拟化: 在虚拟机内部执行

```
lscpu
```

输出信息中有

```
Virtualization:      VT-x
Hypervisor vendor:   KVM
Virtualization type: full
```

并且，此时可以通过 `ls -lh /dev/kvm`看到该设备。

# level 2虚拟机 - 安装nested虚拟机

现在，物理服务器上的虚拟机 `fedora28` 已经具备了KVM虚拟化功能，所以我们可以在这个虚拟机内部再安装一个虚拟机。

* 安装KVM运行环境软件

```
sudo yum install libvirt virt-install qemu-kvm
```

启动libvirtd服务

```
systemctl start libvirtd
systemctl enable libvirtd
```

* 创建虚拟机

```
virt-install \
  --network bridge:virbr0 \
  --name nested-centos7 \
  --ram=2048 \
  --vcpus=2 \
  --disk path=/var/lib/libvirt/images/nested-centos7.qcow2,format=qcow2,bus=virtio,cache=none,size=8 \
  --graphics none \
  --location=http://mirrors.163.com/centos/7/os/x86_64/ \
  --extra-args="console=tty0 console=ttyS0,115200"
```

> 嵌套的虚拟机磁盘选择了了8G（为一级虚拟机磁盘空间的一半），实践验证CentOS minimal安装只需要消耗大约3G空间（boot分区采用xfs消耗1G，swap消耗800M，操作系统消耗1G）。不过，为了能够正常测试，需要预留一定磁盘空间。

> 192.168.122.37

# CentOS环境

最小化安装的CentOS缺少一些必要的编译工具来完成测试，这里参考 [CentOS最小化安装后软件安装](../../../os/linux/redhat/package/yum_after_mini_install)

```
yum -y install which sudo nmap-ncat mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git
```

# 测试性能

在物理服务器上运行的 `L1层虚拟机` 性能和 虚拟机内部运行 `L2层虚拟机` 差距究竟有多大能？有没有实用价值？

> 测试硬件是MacBook Air 2015笔记本，物理硬件是 i5-4260U CPU @ 1.40GHz

* [Unixbench](../../../performance/utilities/unixbench)

```
yum -y install gcc gcc-c++ make libXext-devel

wget https://github.com/kdlucas/byte-unixbench/archive/v5.1.3.tar.gz

tar xf v5.1.3.tar.gz
cd byte-unixbench-5.1.3/UnixBench
make
```

运行

```
./Run
```

UnixBench性能对比（数值是测试结果 System Benchmarks Index Score ）:

| 主机 | 单核 | 双核 |
| ---- | ---- | ---- |
| ubuntu 18.04.1 (物理主机) | 1184.7 | 2016.5 |
| centos7（第一层虚拟化） | 771 | 1218.3 |
| nested-centos7（嵌套虚拟化） | 583 | 973.5 |
| 性能差异 | -24.4% | -20.1% |

**`嵌套虚拟化`单核性能下降25%，多核(2个cpu)性能下降了20%**

> 这里测试的物理主机ubuntu 18.04.1 ，内核版本 4.15.0-38 ，和虚拟机内核差异较大，测试性能仅可参考。
>
> 简单测试发现第一层虚拟化性能降低也非常明显：单核性能下降了 35% ，双核性能下降了 40%。所以kvm虚拟化实际开销也是很大的。
>
> 这里对比虚拟化和物理主机没有做优化，仅采用操作系统默认安装配置，后续再做性能优化后对比测试。（适当优化的KVM性能应该可以单核仅降低10%，多核性能降低控制在18%）

* [fio](https://github.com/axboe/fio) 

```
yum -y install libaio-devel

wget https://github.com/axboe/fio/archive/fio-3.12.tar.gz

tar xf fio-3.12.tar.gz
cd fio-fio-3.12/
./configure
make
make install
```

> debian/ubuntu 需要安装 `libaio-dev` 软件包后才可编译安装fio。并建议安装 `zlib1g-dev`

> 性能对比测试，参考 https://help.aliyun.com/document_detail/25382.html?spm=a2c4g.11186623.2.23.6b00729fmha5DR

运行随机读测试

```
fio -direct=1 -iodepth=128 -rw=randread -ioengine=libaio -bs=4k -size=1G -numjobs=2 -runtime=1000 -group_reporting -filename=iotest -name=Rand_Read_Testing
```

运行随机写测试

```
fio -direct=1 -iodepth=128 -rw=randwrite -ioengine=libaio -bs=4k -size=1G -numjobs=2 -runtime=1000 -group_reporting -filename=iotest -name=Rand_Write_Testing
```

> `numjobs` 设置成和虚拟机cpu数量相同，可以通过 `cat /sys/block/vda/mq/0/cpu_list`查看到磁盘队列对应的可用cpu是 `0, 1`，也就是2个处理器，所以设置成`-numjobs=2`可以测试出最大性能。

| 主机 | 4k随机读（IOPS） | 4k随机读（带宽 MB/s） | 4k随机写（IOPS） | 4k随机写（带宽 MB/s） |
| ---- | ---- | ---- | ---- | ---- |
| ubuntu 18.04.1 (物理主机) | 52.6k | 215 | 36.2k | 148 |
| centos7（第一层虚拟化） | 38.3k | 157 | 18.6k | 76.1 |
| nested-centos7（嵌套虚拟化） | 18.2k | 71 | 9258 | 37.9 |
| 性能差异 | -52.5% | -54.8% | -50.2% | -50.2% |

**`嵌套虚拟化`磁盘随机写性能下降非常严重，IOPS和带宽性能降低50%以上。**

> 第一层虚拟化性能降低也非常明显：随机写磁盘性能 IOPS下降了 27% 带宽下降了 27%；随机读磁盘性能 IOPS下降49%，带宽下降49%。从性能下降百分比来看，IOPS和带宽的下降是同步比例的，应该是涉及到相同比例的用户态到内核态转换的损耗。

# 参考

* [Configure DevStack with KVM-based Nested Virtualization](https://docs.openstack.org/devstack/latest/guides/devstack-with-nested-kvm.html)
* [Nested Guests](http://www.linux-kvm.org/page/Nested_Guests)
* [How to enable Nested Virtualization in KVM on CentOS 7 / RHEL 7](https://www.linuxtechi.com/enable-nested-virtualization-kvm-centos-7-rhel-7/)

