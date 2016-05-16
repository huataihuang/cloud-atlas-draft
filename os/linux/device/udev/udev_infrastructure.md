# 概述

当服务器启动时，各种磁盘设备、网络设备的初始化顺序是随机的，每次识别出的`sdX`和`ethX`设备可能并不完全相同。例如，如果服务器上插了U盘，再次启动，可能U盘被识别成`sda`设备，而原先服务器中安装的命名为`sda`SAS磁盘可能被识别成`sdb`设备。

`udev` 是 Linux2.6 内核里的一个功能，它替代了原来的 `devfs`，成为当前 Linux 默认的设备管理工具。`udev` 以守护进程的形式运行，通过侦听内核发出来的 `uevent` 来管理 `/dev` 目录下的设备文件。不像之前的设备管理工具，`udev` 在用户空间 (user space) 运行，而不在内核空间 (kernel space) 运行。

 `udev` 只为那些连接到 Linux 操作系统的设备产生设备文件。并且 `udev` 能通过定义一个 `udev` 规则 (`rule`) 来产生匹配设备属性的设备文件，这些设备属性可以是内核设备名称、总线路径、厂商名称、型号、序列号或者磁盘大小等等。
 
* 动态管理：当设备添加 / 删除时，`udev` 的守护进程侦听来自内核的 `uevent`，以此添加或者删除 `/dev` 下的设备文件，所以 `udev` 只为已经连接的设备产生设备文件，而不会在 `/dev` 下产生大量无用的设备文件。
* 自定义命名规则：通过 Linux 默认的规则文件，`udev` 在 `/dev/` 里为所有的设备定义了内核设备名称，比如 `/dev/sda`、`/dev/hda`、`/dev/fd`等等。由于 `udev` 是在用户空间 (user space) 运行，Linux 用户可以通过自定义的规则文件，灵活地产生标识性强的设备文件名，比如 `/dev/boot_disk`、`/dev/root_disk`、`/dev/color_printer`等等。
* 设定设备的权限和所有者 `/` 组：udev 可以按一定的条件来设置设备文件的权限和设备文件所有者 `/` 组。

# udev 配置文件

`/etc/udev/udev.conf`配置有关udev服务的基本设置，例如`udev_root`表示设备目录是`/dev/`，这个文件一般不需要修改，保持默认配置就可以。

```bash
udev_log="err"
```

> 默认的日志记录级别是`err`，如果改为 info 或者 debug 的话，会有冗长的 udev 日志被记录下来。

主要的规则配置是位于目录`/etc/udev/rules.d`

## udev的规则和规则文件

所有的规则文件必须以`.rules`为后缀名。RHEL 有默认的规则文件，这些默认规则文件不仅为设备产生内核设备名称，还会产生标识性强的符号链接。例如：

```bash
 [root@HOST_RHEL5 ~]# ls /dev/disk/by-uuid/ 
 16afe28a-9da0-482d-93e8-1a9474e7245c
 ```
 
但这些链接名较长，不易调用，所以通常需要自定义规则文件，以此产生易用且标识性强的设备文件或符号链接。

`udev` 按照规则文件名的字母顺序来查询全部规则文件，然后为匹配规则的设备管理其设备文件或文件链接。虽然 `udev` 不会因为一个设备匹配了一条规则而停止解析后面的规则文件，但是解析的顺序仍然很重要。**通常情况下，建议让自己想要的规则文件最先被解析。**比如，创建一个名为 `/etc/udev/rules.d/10-myrule.rules`的文件，并把你的规则写入该文件，这样 `udev` 就会在解析系统默认的规则文件之前解析到你的文件。

规则都是由多个 键值对（`key-value pairs`）组成，并由逗号隔开，键值对可以分为 `条件匹配键值对`( 以下简称“`匹配键`”) 和 `赋值键值对`( 以下简称“`赋值键`”)，一条规则可以有多条匹配键和多条赋值键。匹配键是匹配一个设备属性的所有条件，**当一个设备的属性匹配了该规则里所有的匹配键，就认为这条规则生效**，然后按照赋值键的内容，执行该规则的赋值。

* 简单说明键值对的例子

```bash
KERNEL=="sda", NAME="my_root_disk", MODE="0660"
```

`KERNEL` 是匹配键，`NAME` 和 `MODE` 是赋值键。这条规则的意思是：如果有一个设备的内核设备名称为 `sda`，则该条件生效，执行后面的赋值：在 `/dev`下产生一个名为 `my_root_disk`的设备文件，并把设备文件的权限设为 `0660`。

为什么 KERNEL 是匹配键，而 NAME 和 MODE 是赋值键呢？这由中间的操作符 (operator) 决定。

**仅当操作符是“==”或者“!=”时，其为匹配键；若为其他操作符时，都是赋值键。**

* udev 规则的所有操作符：

| 符号 | 说明 |
| ---- | ---- |
| `==` | 比较键、值，若等于，则该条件满足 |
| `!=` | 比较键、值，若不等于，则该条件满足 |
| `=` |  对一个键赋值 |
| `+=` | 为一个表示多个条目的键赋值 |
| `:=` | 对一个键赋值，并拒绝之后所有对该键的改动。目的是防止后面的规则文件对该键赋值。 |

* udev 规则的匹配键

| 匹配键 |  说明 |
| ---- | ---- |
| `ACTION` | 事件 (uevent) 的行为，例如：add( 添加设备 )、remove( 删除设备 )。|
| `KERNEL` | 内核设备名称，例如：sda, cdrom。|
| `DEVPATH` | 设备的 devpath 路径。 |
| `SUBSYSTEM` | 设备的子系统名称，例如：sda 的子系统为 block。 |
| `BUS` | 设备在 devpath 里的总线名称，例如：usb。 |
| `DRIVER` | 设备在 devpath 里的设备驱动名称，例如：ide-cdrom。 
| `ID` | 设备在 devpath 里的识别号。 |
| `SYSFS{filename}` | 设备的 devpath 路径下，设备的属性文件“filename”里的内容。例如：SYSFS{model}==“ST936701SS”表示：如果设备的型号为 ST936701SS，则该设备匹配该 匹配键。在一条规则中，可以设定最多五条 SYSFS 的 匹配键。 |
| `ENV{key}` | 环境变量。在一条规则中，可以设定最多五条环境变量的 匹配键。 |
| `PROGRAM` | 调用外部命令。 |
| `RESULT` | 外部命令 `PROGRAM` 的返回结果。例如：`PROGRAM=="/lib/udev/scsi_id -g -s $devpath", RESULT=="35000c50000a7ef67"` 调用外部命令 `/lib/udev/scsi_id`查询设备的 `SCSI ID`，如果返回结果为 `35000c50000a7ef67`，则该设备匹配该 匹配键。 |

* udev 的重要赋值键

| 赋值键 | 说明 |
| ---- | ---- |
| `NAME` | 在 /dev下产生的设备文件名。只有第一次对某个设备的 NAME 的赋值行为生效，之后匹配的规则再对该设备的 NAME 赋值行为将被忽略。如果没有任何规则对设备的 NAME 赋值，udev 将使用内核设备名称来产生设备文件。 |
| `SYMLINK` | 为 /dev/下的设备文件产生符号链接。由于 udev 只能为某个设备产生一个设备文件，所以为了不覆盖系统默认的 udev 规则所产生的文件，推荐使用符号链接。 |
| `OWNER`, `GROUP`, `MODE` | 为设备设定权限。 |
| `ENV{key}` | 导入一个环境变量。 |

* udev 的值和可调用的替换操作符

| 值 | 说明 |
| ---- | ---- |
| `$kernel`, `%k` | 设备的内核设备名称，例如：sda、cdrom。 |
| `$number`, `%n` | 设备的内核号码，例如：sda3 的内核号码是 3。 |
| `$devpath`, `%p` | 设备的 devpath路径。 |
| `$id`, `%b` | 设备在 devpath里的 ID 号。 |
| `$sysfs{file}`, `%s{file}` | 设备的 sysfs里 file 的内容。其实就是设备的属性值。 例如：`$sysfs{size}` 表示该设备 ( 磁盘 ) 的大小。 |
| `$env{key}`, `%E{key}` | 一个环境变量的值。 |
| `$major`, `%M` | 设备的 major 号。 |
| `$minor`,`%m` | 设备的 minor 号。 |
| `$result`, `%c` | PROGRAM 返回的结果。 |
| `$parent`, `%P` | 父设备的设备文件名。 |
| `$root`, `%r` | udev_root的值，默认是 /dev/。 |
| `$tempnode`, `%N` | 临时设备名。 |
| `%%` | 符号 % 本身。 |
| `$$` | 符号 $ 本身。 |

**替换操作符的规则例子**

```bash
 KERNEL=="sd*", PROGRAM="/lib/udev/scsi_id -g -s %p", \
 RESULT=="35000c50000a7ef67", SYMLINK="%k_%c"
 ```

该规则的执行：如果有一个内核设备名称以 sd 开头，且 SCSI ID 为 35000c50000a7ef67，则为设备文件产生一个符号链接“sda_35000c50000a7ef67”

# 如何查找设备的信息 ( 属性 ) 来制定 udev 规则

当我们为指定的设备设定规则时，首先需要知道该设备的属性，比如设备的序列号、磁盘大小、厂商 ID、设备路径等等。通常我们可以通过以下的方法获得：

* 查询sysfs文件系统

`sysfs` 里包含了很多设备和驱动的信息。例如：设备 `sda` 的 `SYSFS{size}` 可以通过 `cat /sys/block/sda/size` 得到；`SYSFS{model}` 信息可以通过 `cat /sys/block/sda/device/model` 得到。

* `udevinfo`命令

`udevinfo` 可以查询 udev 数据库里的设备信息。例如：用 udevinfo 查询设备 sda 的 model 和 size 信息

```bash
 [root@HOST_RHEL5 rules.d]# udevinfo -a -p /block/sda | egrep "model|size"
    SYSFS{size}=="71096640"
    SYSFS{model}=="ST936701SS      "
```

# udev 的简单规则

* 产生网卡设备文件的规则

```bash
 SUBSYSTEM=="net", SYSFS{address}=="AA:BB:CC:DD:EE:FF", NAME="public_NIC"
 ```
 
该规则表示：如果存在设备的子系统为 `net`，并且地址 (MAC address) 为“`AA:BB:CC:DD:EE:FF`”，为该设备产生一个名为 `public_NIC` 的设备文件。

* 为指定大小的磁盘产生符号链接的规则

```bash
 SUBSYSTEM=="block", SYSFS{size}=="71096640", SYMLINK ="my_disk"
``` 

该规则表示：如果存在设备的子系统为 `block`，并且大小为 `71096640`(block)，则为该设备的设备文件名产生一个名为 my_disk 的符号链接。

* 通过外部命令为指定序列号的磁盘产生设备文件的规则
 
 ```bash
 KERNEL=="sd*[0-9]", PROGRAM=="/lib/udev/scsi_id -g -s %p", \
 RESULT=="35000c50000a7ef67", NAME +="root_disk%n"
 ```
 
该规则表示：如果存在设备的内核设备名称是以 `sd` 开头 ( 磁盘设备 )，以数字结尾 ( 磁盘分区 )，并且通过外部命令查询该设备的 `SCSI_ID` 号为“`35000c50000a7ef67`”，则产生一个以 `root_disk` 开头，内核号码结尾的设备文件，并替换原来的设备文件（如果存在的话）。例如：产生设备名 `/dev/root_disk2`，替换原来的设备名 `/dev/sda2`。运用这条规则，可以在 `/etc/fstab`里保持系统分区名称的一致性，而不会受驱动加载顺序或者磁盘标签被破坏的影响，导致操作系统启动时找不到系统分区。

# 其他常用的 udev 命令

* `udevtest`

`udevtest`会针对一个设备，在不需要 `uevent` 触发的情况下模拟一次 `udev` 的运行，并输出查询规则文件的过程、所执行的行为、规则文件的执行结果。通常使用 `udevtest`来调试规则文件。以下是一个针对设备 `sda` 的 `udevtest` 例子。由于 `udevtest` 是扫描所有的规则文件 ( 包括系统自带的规则文件 )，所以会产生冗长的输出。

```bash
KERNEL=="sd*", PROGRAM="/lib/udev/scsi_id -g -s %p", RESULT=="35000c50000a7ef67", \
NAME="root_disk%n", SYMLINK="symlink_root_disk%n"
```

`udevtest`执行过程输出

```bash
main: looking at device '/block/sda' from subsystem 'block'
 run_program: '/lib/udev/scsi_id -g -s /block/sda'
 run_program: '/lib/udev/scsi_id' (stdout) '35000c50000a7ef67'
 run_program: '/lib/udev/scsi_id' returned with status 0 
 udev_rules_get_name: reset symlink list 
 udev_rules_get_name: add symlink 'symlink_root_disk'
 udev_rules_get_name: rule applied, 'sda' becomes 'root_disk'
 udev_device_event: device '/block/sda' already in database, \
                  validate currently present symlinks 
 udev_node_add: creating device node '/dev/root_disk', major = '8', \
            minor = '0', mode = '0660', uid = '0', gid = '0'
 udev_node_add: creating symlink '/dev/symlink_root_disk' to 'root_disk'
```

可以看出，`udevtest`对 `sda` 执行了外部命令 `scsi_id`, 得到的 `stdout` 和规则文件里的 `RESULT` 匹配，所以该规则匹配。然后 ( 模拟 ) 产生设备文件 `/dev/root_disk`和符号链接 `/dev/symlink_root_disk`，并为其设定权限。

* `start_udev`

`start_dev`命令重启 `udev` 守护进程，并对所有的设备重新查询规则目录下所有的规则文件，然后执行所匹配的规则里的行为。通常使用该命令让新的规则文件立即生效。`start_udev`一般没有标准输出，所有的 `udev` 相关信息都按照配置文件 (`udev.conf`)的参数设置，由 `syslog`记录。

# 重新加载udev规则

```bash
udevadm control --reload-rules
```

也可能发行版使用的命令是`udevcontrol --reload-rules`

# 参考

* [使用 udev 高效、动态地管理 Linux 设备文件](http://www.ibm.com/developerworks/cn/linux/l-cn-udev/index.html) - 非常完善的文档，本文即转载此文档
* [详解udev](http://www.cnblogs.com/sopost/archive/2013/01/09/2853200.html)
* [WikiPedia - udev](https://en.wikipedia.org/wiki/Udev)
* [ArchLinux - udev](https://wiki.archlinux.org/index.php/Udev)