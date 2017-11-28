# libvirt定制事件脚本

从libvirt 0.8.0开始，host主机的特定事件可以触发定制脚本。

这些定制`hook`脚本在一下情况下触发：

* libvirt服务启动，停止或重新加载配置 - 版本0.8.0开始
* QEMU guest启动或停止 - 版本0.8.0开始
* LXC guest启动或停止 - 版本0.8.0开始
* libxl接管的Xen guest启动或停止 - 版本2.1.0开始
* 网络启动或停止，或者网络的接口插入/拔出 - 版本1.2.2开始

# 定制脚本位置

libvirt hook脚本位于目录`$SYSCONFDIR/libvirt/hooks/`:

* 在Linux发行版，例如Fedora和RHEL，默认是`/etc/libvirt/hooks/`目录
* 如果是从源代码编译libvirt，则可能位于`/usr/local/etc/libvirt/hooks/`目录

要使用hook脚本，需要手工创建`hooks`目录，并且将hook脚本存放到该目录中，并设置脚本可执行。

# 脚本命名

如上所述，以下是5个脚本调用名称：

* `/etc/libvirt/hooks/daemon`

libvirt服务启动，停止或重新加载配置时执行

* `/etc/libvirt/hooks/qemu`

QEMU guest启动、停止或迁移时执行

* `/etc/libvirt/hooks/lxc`

LXC guest启动或停止时执行

* `/etc/libvirt/hooks/libxl`

libxl接管的Xen guest启动、停止或迁移时执行

* `/etc/libvirt/hooks/network`

网络启动或停止，或者网络的接口插入/拔出时执行

# 脚本结构

hook脚本执行使用标准的Linux进程创建功能，使用以下命令解释器：

```
#!/bin/bash
```

或者

```
#!/usr/bin/python
```

> 可以使用任何可执行代码，也就是可以使用自己希望的语言

> **注意**：`bash`脚本开头必须设置好解释器，否则会出现（假设这里虚拟机名字是`example_virt_guest`）执行格式错误：

```
error: Hook script execution failed: internal error: Child process (LC_ALL=C PATH=/sbin:/usr/sbin:/bin:/usr/bin HOME=/home/admin USER=admin LOGNAME=admin /etc/libvirt/hooks/qemu example_virt_guest prepare begin -) unexpected exit status 1: libvirt:  error : cannot execute binary /etc/libvirt/hooks/qemu: Exec format error
```

> **注意**：`libvirt`只支持qemu启动或停止时候调用脚本，但是如果是guest os出现crash重启，则不属于qemu重启，就不会触发脚本执行。例如：[libvirt pvpanic](../qemu/libvirt_pvpanic)情况下就不会触发hook脚本执行，需要自己定制修改libvirt代码。

# 脚本参数

> 这段没有理解，待开发实践

hook脚本调用使用特定的命令行参数，根据脚本和操作而不同：

guest hook脚本，qemu和lxc，会在标准输入上获得domain的完整XML描述。哲包括诸如domain的UUID和它的存储类型，以及提供脚本所需的所有libvirt信息。

对于所有案例，网络hook脚本的标准输入提供了完整的有关网络状态的XML描述，类似如下格式：

```xml
<hookData>
  <network>
     <name>$network_name</name>
     <uuid>afca425a-2c3a-420c-b2fb-dd7b4950d722</uuid>
     ...
  </network>
</hookData>
```

在网络的接口插入/拔出时，网络XML使用包含接口插拔的domain的完整XML描述：

```xml
<hookData>
  <network>
     <name>$network_name</name>
     <uuid>afca425a-2c3a-420c-b2fb-dd7b4950d722</uuid>
     ...
  </network>
  <domain type='$domain_type' id='$domain_id'>
     <name>$domain_name</name>
     <uuid>afca425a-2c3a-420c-b2fb-dd7b4950d722</uuid>
     ...
  </domain>
</hookData>
```

# 参数

以下时传递给每个hook脚本的跟随参数：

> 这里仅翻译整理了有关libvirt/qemu部分（因为我的开发工作主要围绕kvm）

* `/etc/libvirt/hooks/daemon`

当libvirt服务启动，脚本调用如下

```
/etc/libvirt/hooks/daemon - start - start
```

当libvirt服务停止，脚本调用

```
/etc/libvirt/hooks/daemon - shutdown - shutdown
```

当libvirt服务接收到`SIGHUP`信号，它将重新加载配置并触发hook脚本如下：

```
/etc/libvirt/hooks/daemon - reload begin SIGHUP
```

> 注意：当`libvirt`服务重启，这个`daemon`脚本只在`shutdown`操作发生时调用一次；而后在`start`操作则没有特定的操作针对`restart`。

* `/etc/libvirt/hooks/qemu`

# 参考

* [Hooks for specific system management](https://www.libvirt.org/hooks.html)