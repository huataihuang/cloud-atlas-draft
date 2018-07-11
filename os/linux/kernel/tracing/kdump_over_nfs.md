在[获取内核core dump](get_kernel_core_dump)介绍了如何通过获取内核core dum来排查系统宕机等异常，这是Linux平台内核开发和debug的基本技术。

在线上海量服务器运维的时候，会遇到一些特定的需求，需要集中管理服务器kernel core dump：

* 服务器本地磁盘空间有限，甚至可能没有本地磁盘。例如，云计算有一种采用无盘方式部署的计算节点。
* 通过平台对内核core进行自动化分析，需要将海量服务器中异常导致的kernel core dump采集到分析平台。

Linux的kdump有两种方式支持基于网络的kernel core dump:

* kdump over nfs
* kdump over ssh

`kdump over nfs`原理是：当内核core dump时，reboot到微内核，立即通过NFS协议挂载远程服务器共享的NFS存储，直接将kernel core dump保存到远程服务器存储中。这种方式不需要本地磁盘，而且当出现本地磁盘故障引发内核异常时，通过网络方式输出core dump也避免了本地磁盘无法写入的问题。

`kdump over ssh`原理类似，区别是reboot到微内核时候，是通过ssh方式输出core dump文件，所以要求主机具有无需密码能够ssh访问存储服务器。这个配置比`kdump over nfs`要复杂一些，主要麻烦是分发管理ssh密钥。

> 本文介绍如何实现基于网络的`kdump over nfs`。

# 准备工作

* 主机内核配置

主机内核参数中需要设置 `crashkernel=auto` ，这是推荐设置，不在需要计算为为微内核预留的内存量。

* 估算kdump大小

> `makedumpfile`工具提供了估算kdump文件大小的参数 `--mem-usage` ，不过需要内核支持 `p_paddr`

```
makedumpfile --mem-usage /proc/kcore
```

* `NFS存储服务器`配置NFS共享存储输出：

> 详细参考[CentOS 7 NFS设置](../../../../service/nfs/setup_nfs_on_centos7)

硬盘挂载到 `/data` 目录

```
mount /dev/sdb1 /data
```

使用以下命令安装 NFS 支持

```
yum install nfs-utils nfs-utils-lib
```

编辑存储服务器的`/etc/exports`配置文件

```
/data	192.168.122.0/24(rw,sync,no_root_squash,no_subtree_check)
```

设置nfs相关服务在操作系统启动时启动

```
systemctl enable rpcbind
systemctl enable nfs-server
systemctl enable nfs-lock
systemctl enable nfs-idmap  
```

启动nfs服务

```
systemctl start rpcbind
systemctl start nfs-server
systemctl start nfs-lock
systemctl start nfs-idmap
```

# kdump配置

## 默认kummp配置

在RHEL/CentOS 7操作系统上，默认已经启用了kdump服务，默认配置如下

```
path /var/crash
core_collector makedumpfile -l --message-level 1 -d 31
```

配置解析：

* `path /var/crash` 默认将kernel core dump存储到`/var/crash`目录。对于无盘云计算的Compute Node，在kdump时是无法写入本地磁盘的，所以这行配置需要修改，见下文。
* `core_collector` 是设置内核core的采集器，这里只支持`makedumpfile`。
  * 参数`-l`表示采用默认压缩算法是 `lzo`，其他参数有`-c`表示`zlib`压缩，`-p`表示`snappy`压缩。
  * `-d 31`表示dump level，`-d`参数表示摈弃掉不需要的内存页，这个值是你期望忽略的内存页对应值的累加结果值。默认的参数是 `-d 31` ，其实就是把上诉所有不需要的内存页全部摈弃掉。

| Option | 说明 |
| ---- | ---- |
| 1 | Zero pages |
| 2 | Cache pages |
| 4 | Cache private |
| 8 | User pages |
| 16 | Free pages |

> `zero pages`: 当一个进程第一次对一个页进行读操作时，而且该页不在内存中时，kernel应该给进程分配一个新的页帧，更安全的做法是分配一个`filled with zero`的页帧给进程，这样才能保证别的进程的信息不会被新的进程给读取，所以linux中保留的一个这样`filled with zero`的页帧，叫`zero page`，当这种情况发生时，系统就将`zero page`填入页表中，并标记为不可写。当进程要对zero page进行写操作时则
`copy on write` 机制就会被触发。 https://blog.csdn.net/longxj04/article/details/3897432

```
            |         non-
      Dump  |  zero   private  private  user    free
      Level |  page   cache    cache    data    page
     -------+---------------------------------------
         0  |
         1  |   X
         2  |           X
         4  |           X        X
         8  |                            X
        16  |                                    X
        31  |   X       X        X       X       X
```

## nfs存储core dump配置

* `/etc/kdump.conf`配置

要支持将主机kernel core dump存储到远程NFS共享存储，配置只需要修改一行，增加如下配置

```
nfs 192.168.122.1:/data/nfs_share
```

主机`/etc/kdump.conf`完整配置如下：

```
nfs 192.168.122.1:/data/nfs_share
path /var/crash
core_collector makedumpfile -l --message-level 1 -d 31
```

> 这里设置NFS服务器上`/data/nfs_share`目录作为保存目录，加上配置`path /var/crash`，完整的存储路径就是`/data/nfs_share/var/crash`。所以必须确保NFS服务器上（ **注意：在NFS服务器上执行以下命令** ），预先创建好这个目录:

```
mkdir -p /data/nfs_share/var/crash
```

> 当重启主机（输出kernel core dump的主机，也就是计算节点）的`kdump`服务时，会自动检测远程NFS服务器上是否有该目录，如果缺少该目录，就会直接报错，无法正确生成主机`kdump`需要的`initramfs`。

* 重启kdump服务

```
systemctl stop kdump
systemctl start kdump
```

启动kdump服务后，通过`systemctl status kdump -l`检查是否正常`rebuild initramfs`，例如，上述如果没有正确创建NFS服务器上存储core的目录，就会导致kdump服务器启动失败。

# 验证

请参考 [串口管理程序conman](../../../../server/ipmi/conman) 设置好主机串口控制台，验证能够通过 `conman <server_name>` 连接到主机串口控制台。我们准备通过串口给服务器发送 `sysrq magic` 组合键来触发crash，以便能够验证kernel core dump是否正确输出到远程NFS服务器存储中。

* 启用内核支持 `sysrq magic`

> 服务器建议预先默认启用`sysrq`，这样在异常时，可以随时外接键盘发送`sysrq magic`组合键，或者通过串口conman发送`sysrq`触发crash kernel core dump

```
cat << EOF > /etc/sysctl.d/kernel_debug.conf
kernel.sysrq = 1
EOF
```

然后刷新

```
sysctl --system
```

如果仅仅想测试一次，不想默认启用`sysrq`，则不添加配置文件`/etc/sysctl.d/kernel_debug.conf`仅仅执行如下命令临时启用`sysrq`：

```
echo 1 > /proc/sys/kernel/sysrq
```

* 通过conman连接服务器串口控制台，然后按下如下组合键触发crash：
    * `Bt` - （可选）生成堆栈跟踪
    * `Bm` - （可选）打印内存状态，特别是在out of memory情况，特别需要此项信息
    * `Bc` - 触发crash dump

> 注意：大写字幕`B`表示`serial-break`字符，对于conman就是同时按下 `&B`。例如，这里`Bc`就是表示先同时按下`&B`，然后放开按键，马上按一下`c`，就能够 **触发crash dump**

# 自动生成主机kernel core dump

对于服务器随机的异常，不可能随时人工去完成触发内核core dump来采集必要的信息。此时可以利用内核的NMI watchdog以及出现softlockup自动触发panic来实现生成kernel core dump。

> **`警告`** ：`不要`在线上服务器直接开启以下自动生成kernel core dump的配置，这是一个危险的参数。仅用于故障排查的少量debug服务器。否则可能会触发线上大量服务器的异常重启（因为kernel core dump会需要重启服务器）。

```
cat << EOF > /etc/sysctl.d/kernel_debug.conf
kernel.sysrq = 1
kernel.softlockup_panic = 1
kernel.panic_on_io_nmi = 1
kernel.panic_on_unrecovered_nmi = 1
kernel.unknown_nmi_panic = 1
kernel.panic_on_warn=1
EOF
```

然后刷新

```
sysctl --system
```

> `kernel.panic_on_warn=1`比较危险，即使非致命的内核错误也可能会有可忽略的warning，如果启用这个参数，则可能在warning时候直接触发kernel core dump。

上述配置后，服务器如果有硬件异常或者软件BUG导致的softlockup，都会立即触发内核kernel core dump，并实现远程NFS集中采集。后续就可以通过自动化平台进行分析，监控和告警。