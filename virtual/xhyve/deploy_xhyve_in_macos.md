[xhyve hypervisor](https://github.com/mist64/xhyve)是将[bhyve](www.bhyve.org) port到OS X的开源项目。xhyve构建在OS X 10.10的 [Hypervisor.framework](https://developer.apple.com/documentation/hypervisor)或者更高版本，完全运行在用户空间，没有其他依赖。xhyve可以运行FreeBSD或vanilla Linux发行版。相关介绍见 [xhyve – Lightweight Virtualization on OS X Based on bhyve](http://www.pagetable.com/?p=831) 。

# bhyve架构

```
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
```

# 安装xhyve

xhyve hypervisor安装有多种方法，最简单的是通过homebrew:

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew update
brew install --HEAD xhyve
```

> [Homebrew](https://brew.sh/)官方提供了安装指南

> `--HEAD`在brew命令中确保总是获得最新修改，即使homebrew数据库还没有更新。

如果重新安装，`brew`也提供了`reinstall`命令，即 `brew reinstall xhyve`

---

如果使用MacPorts则简单执行

```
sudo port selfupdate
sudo port install xhyve
```

最后，也可以自行编译：

```
git clone https://github.com/machyve/xhyve.git
cd xhyve
xcodebuild
```

编译后执行程序位于 `build/Release/xhyve`。 在最新的 macOS Mojave 10.14.1 编译成功，运行 `xhyve -h`失败，显示

```
Killed: 9
```

不过，我使用 make 编译生成的 `build/xhyve` 可以运行，并且能够启动 `4.15` 内核，但显示不能找到磁盘设备：

```
Gave up waiting for root file system device.  Common problems:
 - Boot args (cat /proc/cmdline)
   - Check rootdelay= (did the system wait long enough?)
 - Missing modules (cat /proc/modules; ls /dev)
ALERT!  /dev/vda1 does not exist.  Dropping to a shell!
```

> **目前采用 homebrew 安装的 xhyve**

# 使用xhyve

```
xhyve -h
```

# 在xhyve中运行Tiny Core Linux

```
git clone https://github.com/mist64/xhyve
cd xhyve
make
./xhyverun.sh
```

此时会看到启动了一个[Tiny Core Linux](http://tinycorelinux.net/)运行在终端中，使用命令 `uname -a` 和 `df -h`命令可以看到这是一个完整的Linux运行环境。

关闭虚拟机的方法是执行 `sudo halt`

* [在xhyve中运行RHEL/CentOS](virtual/xhyve/run_rhel_centos_in_xhyve.md)
* [在xhyve中运行Debian/Ubuntu](virtual/xhyve/run_debian_ubuntu_in_xhyve.md)

# 参考

* [xhyve.org](https://github.com/mist64/xhyve)
* [Set up xhyve with Ubuntu 16.04](https://gist.github.com/mowings/f7e348262d61eebf7b83754d3e028f6c) 建议参考
* [Install an Ubuntu 16.04 VM on macOS using xhyve](https://github.com/rimusz-lab/xhyve-ubuntu)
* [Virtualization on Mac OS X using Vagrant (Part 2)](https://medium.com/@fiercelysw/virtualization-on-mac-os-x-using-vagrant-part-2-3173efc754a8) - 最好的方式：启动xhyve，并使用vagrant来管理，则标准化，更为易用

----

* [Running Mac OS X El Capitan and macOS Sierra on QEMU/KVM](https://github.com/kholia/OSX-KVM) 提供了在KVM环境中运行macOS的方法（反过来哦，和我这里实践不同，是在Ubuntu中运行macOS）