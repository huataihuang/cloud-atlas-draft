[xhyve hypervisor](https://github.com/mist64/xhyve)是将[bhyve](www.bhyve.org) port到OS X的开源项目。xhyve构建在OS X 10.10的 [Hypervisor.framework](https://developer.apple.com/documentation/hypervisor)或者更高版本，完全运行在用户空间，没有其他依赖。xhyve可以运行FreeBSD或vanilla Linux发行版。相关介绍见 [xhyve – Lightweight Virtualization on OS X Based on bhyve](http://www.pagetable.com/?p=831) 。

# bhyve架构

                                                           Linux
               I/O        VM control       FreeBSD        NetBSD
                                                          OpenBSD
             |     A        |     A           |              |
             V     |        V     |           V              V
         +-------------++-------------++-------------++-------------+
         |             ||             ||             ||             |
         |    bhyve    ||  bhyvectl   ||  bhyveload  || grub2-bhyve |
         |             ||             ||             ||             |
         |             ||             ||             ||             |
         +-------------++-------------++-------------++-------------+
         +----------------------------------------------------------+
         |                        libvmmapi                         |
         +----------------------------------------------------------+
                                       A
                                       |                         user
         ------------------------------┼------------------------------
                                       | ioctl         FreeBSD kernel
                                       V
                         +----------------------------+
                         |        VMX/SVM host        |
                         |       VMX/SVM guest        |
                         |   VMX/SVM nested paging    |
                         |           Timers           |
                         |         Interrupts         |
                         +----------------------------+
                          vmm.ko


# 在xhyve中运行Tiny Core Linux

```
git clone https://github.com/mist64/xhyve
cd xhyve
make
./xhyverun.sh
```

此时会看到启动了一个[Tiny Core Linux](http://tinycorelinux.net/)运行在终端中，使用命令 `uname -a` 和 `df -h`命令可以看到这是一个完整的Linux运行环境。

关闭虚拟机的方法是执行 `sudo halt`

# 在xhyve中运行Ubuntu

# 参考

* [xhyve.org](https://github.com/mist64/xhyve)
* [Running Mac OS X El Capitan and macOS Sierra on QEMU/KVM](https://github.com/kholia/OSX-KVM) 提供了在KVM环境中运行macOS的方法