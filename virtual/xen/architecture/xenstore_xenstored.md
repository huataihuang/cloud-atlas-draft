# XenStore

**XenStore** 是通过Xenstored维护的domains之间共享的信息存储空间，它无需大量的数据传输就可以提供配置和状态信息。每个domain在store中获取各自的路径，类似从`procfs`独立获取信息。当Xenstore中的存储值变化时，相应的驱动就会被通知。有关使用XenStore进行开发的信息参考[XenBus](http://wiki.xen.org/wiki/XenBus)。

XenStore是一个层次化的名字空间（类似sysfs或Open Firmware），在domain之间共享。Xen在domain间通讯的原始输出是非常底层的（虚拟IRQ和共享内存）。XenStore是在这些原始信息之上实现并提供了一些高层的操作（读取key，写入key，列举目录，当key值修改时通知）。

> Xenstore 的目录是层次似的 `key-data` 值对。每个域都有一个目录继承结构，包含存储它自身的信息，主要是配置信息。这些信息一般存储于一个数据库中，位于`/var/lib/xenstored/tdb`。
>
> 内部的`3`个主要的路径：
>
> * `/vm`：包含和域相关的配置；
> * `/local/domain`：本节点上存储的信息；
> * `/tool`：包含不同用户模态下的工具。


XenStore是一个数据库，由domain 0运行，支持交易和原子化操作。XenStore可以通过Domain-0的Unix domain socket（内核级别的API）来访问，或者通过`/proc/xen/xenbus`的ioctl接口访问。XenStore总是可以通过在`<xs.h>`定义的功能来访问。XenStore是domain运行时用于存储有关domain的信息，并且作为创建和控制Domain-U设备的机制。

> [pyxs](https://github.com/selectel/pyxs) 提供了纯Python接口和xenstore交互，详细文档可参考[http://pyxs.readthedocs.org/en/latest/](http://pyxs.readthedocs.org/en/latest/)

# xenstored

xenstored是一个xenstore daemon来提供dom0和guests获取有关各自的配置空间信息和系统信息。Xen当前支持两个版本的daemon:

* cxenstored - C编写的xenstored，是最初的实现
* oxenstored - Ocaml编写的xenstored，是下一代的xenstored

大多数发行都只提供了cxenstored，不过在oxenstored提供了优化可以更好适用于大规模主机部署xen。

## xenstored unix sockets

xentored创建的Unix sockets:

* `/var/run/xenstored/socket`
* `/var/run/xenstored/socket_ro`

## xenstored kernel ring interface

xenstored内核环接口是guest使用的，因为guest系统无法访问位于dom0的unix sockets，以替代使用xenbus来和xenstored通讯。

# `xenstore-ls`

`xenstore-ls`提供了输出xenstore的内容的方法，如果使用参数 `-f` 则输出平面化的信息

可以先使用 `xm list` 找到需要检查的虚拟机的`id`，然后使用命令 `xenstore-ls -f | grep "domain/<id>"` 检查对应domain的xenstore信息，可以获得相关的虚拟设备信息等配置

# 常用命令：

* `xenstore-chmod`：准许管理员和开发人员手工改变 Xenstore 中任意位置的权限；
* `xenstore-list`：列出存放于目录中存放的 key，或者类别。
* `xenstore-read`：输出和一个特定 key 有关的值。
* `xenstore-write`：改变 key 中存放的值。
* `xenstore-exists`：用于检查一个特定的 key-value 是否存在。
* `xenstore-ls`：输出整个数据库树，包含所有的节点和key-value 值对。
* `xenstore-rm`：删除一个 key。

> `xenstore-ls`是递归地列出所有内容，而`xenstore-list`则只输出指定目录下内容（精简且快速），两者分别用于不同的目的。

可以通过 `xenstore-write` 在host和guest之间传递数据：

例如，host主机上：

```
xenstore-write /local/domain/19/key 1
```

则在guest(dom_id=19)中可以使用

```
xenstore-read key
```

读取到这个值（`1`）

同样可以在guest中修改这个值

```
xenstore-write key 3
```

然后在host主机上同样也可以读到这个key变成了3

```
xenstore-read /local/domain/19/key
```

# 参考

* [XenStore](http://wiki.xen.org/wiki/XenStore)
* [Xenstored](http://wiki.xen.org/wiki/Xenstored)
* [XenStore Reference](http://wiki.xen.org/wiki/XenStoreReference)
* [Running Xen: A Hands-On Guide to the Art of Virtualization -- XenStore](http://www.informit.com/articles/article.aspx?p=1187966&seqNum=7)
* [xenstore](http://blog.csdn.net/cybertan/article/details/6130146)
* [XenStore：使用，结构和原理(1快速入门)](http://www.xuebuyuan.com/930650.html)
* [xenstore相关命令](http://blog.163.com/ap0505618@126/blog/static/82128213201214101140959/)