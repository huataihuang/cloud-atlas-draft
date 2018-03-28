

# kexec

`kexec`严格说并不是热补丁，即内核升级后依然需要重启主机，只不过`kexec`将内核升级限制在内存中避免了完全重启。系统快速加载新的内核并激活它，当新内核加载以后，依然会重启每个运行的服务，但是跳过了整个bootloader和硬件初始化阶段，所以速度会非常快。

# 参考

* [dynup/kpatch](https://github.com/dynup/kpatch)
* [Kernel patching with kexec: updating a CentOS 7 kernel without a full reboot](https://ma.ttias.be/kernel-patching-kexec-updating-centos-7-kernel-without-full-reboot/)