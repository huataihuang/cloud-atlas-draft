[在xhyve中运行Debian/Ubuntu](../../../../virtual/xhyve/run_debian_ubuntu_in_xhyve)可以发现，目前xhyve只支持运行较低版本内核（4.4）当升级到4.15内核后会导致挂起。

所以，当前需要避免xhyve运行的虚拟机内部升级内核，方法是采用`apt-mark`工具：

* 首先检查当前系统运行内核版本：

```
uname -r
```

显示输出

```
4.4.0-131-generic
```

* 然后执行`apt-mark`冻结内核版本升级：

```
sudo apt-mark hold 4.4.0-131-generic
```

此时会提示相关软件包的冻结：

```
linux-image-extra-4.4.0-131-generic set on hold.
linux-image-4.4.0-131-generic set on hold.
```

有了冻结(hold)，当然也有解除冻结：

```
sudo apt-mark unhold 4.4.0-131-generic
```

# 参考

* [How to I prevent Ubuntu from kernel version upgrade and notification?](https://askubuntu.com/questions/938494/how-to-i-prevent-ubuntu-from-kernel-version-upgrade-and-notification/938523)
* [How can you unhold (remove a hold on) a package?](https://askubuntu.com/questions/164587/how-can-you-unhold-remove-a-hold-on-a-package)