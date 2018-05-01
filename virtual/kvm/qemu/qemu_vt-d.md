在QEMU端实现Intel VT-d模拟（guest vIOMMU）技术。

# 使用方法

guest vIOMMU是QEMU中的一个通用设备，当前只有Q35平台支持quest vIOMMU。以下是使用e1000网卡的启动带有guest vIOMMU的Q35虚拟机：

```bash
qemu-system-x86_64 -machine q35,accl=kvm,kernel-irqchip=split -m 2G \
                   -device intel-iommu,intremap=on \
                   -netdev user,id=net0 \
                   -device e1000,netdev=net0 \
                   $IMAGE_PATH
```

# 参考

* [QEMU: Features/VT-d](https://wiki.qemu.org/Features/VT-d)