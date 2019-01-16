# novm

[novm](https://github.com/google/novm)是Google的一个早期采用Go实现type 2 hypervisor的开源项目，已经放弃更新。

novm特点是输出一个文件系统设备作为运行guest，而不是采用传统的虚拟磁盘块设备，易于管理无依赖软件以及打包到单一的虚拟机实例。

你可以认为这是一个仿照Docker的层次化Overlay文件系统的虚拟机，目的是为了轻量化，快速部署。 novm抛弃了传统的硬件模拟，而是采用文件系统运行。我猜测采用类似ZFS或者btrfs来实现文件系统，可以实现类似卷管理。

novm使用了嵌入bootloader，需要依赖ELF kernel binary (vmlinux)，但不是压缩景象（bzImage）。

# crosvm

[Chrome OS Virtual Machine Monitor](https://chromium.googlesource.com/chromiumos/platform/crosvm/) 是目前仍在活跃开发的采用虚拟化设备运行的guest操作系统，但是不模拟实际硬件设备。crosvm通过Linux KVM接口运行VM，但是目标是在围绕虚拟设备的沙盒中运行程序语言以便保护内核不受攻击。

采用虚拟机的虚拟块设备来作为虚拟机的根文件系统，通常是 squashfs 镜像（使用`mksquashfs`制作的镜像，或者使用`mkfs.ext4`制作的镜像文件系统）。

在guest中通过Virtio Wayland支持图形。

系统要求：

* host主机内核支持KVM
* `virtio-wayland` 从Linux 3.17引入了 `memfd_create` syscall， 以及 Wayland compositor
* `vsock` 主机需要支持 vhost-vsock ，内核 Linux 4.8
* `multiprocess` 主机内核支持 seccomp-bpf 和 Linux numaespace
* `virtio-net` 主机内核支持TUN/TAP (/dev/net/tun) 并以 `CAP_NET_ADMIN` 权限运行

