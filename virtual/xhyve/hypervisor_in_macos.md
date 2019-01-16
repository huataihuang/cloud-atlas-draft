从macOS 10.10开始，操作系统内建了Hypervisor framework，提供了和用户空间虚拟化技术交互的C APIs，这样就不需要内核扩展（kernel extensions, KEXTs）。使用这个框架开发的应用程序可以发布到Mac App Store。

硬件加速虚拟机（VMs）和虚拟处理器（vCPUs）可以通过一个标明沙箱的用户空间进程、hypervisor客户程序用来创建和控制。hypervisor框架将虚拟机抽象成作为线程的任务和虚拟进程。

在macOS中运行Hyperviror需要满足以下条件：

* 沙箱化的用户空间进程必须使用`com.apple.vm.hypervisor`权限来使用Hypervisor API
* 硬件必须支持包含了扩展页表（Extended Page Tables, EPT）和无限制模式（Unrestricted Mode）的 Intel VT-x 特性。可以通过传递`kern.hv_support`参数给`sysctl`名林来检查是否提供提供了Hypervisor API。

```
$ sysctl kern.hv_support
kern.hv_support: 1
```

# VM生命周期案例

以下是使用Hypervisor Framework API创建和运行具有一个或多个虚拟CPU的简单生命周期：

![macOS Hypervisor VM生命周期](../../../img/virtual/bhyve/macos/macos_hypervisor_vm_life_cycle.png)

在任务启动是，创建一个VM，映射任务的虚拟地址空间范围到虚拟机的guest物理地址空间，并创建POSIX线程。然后，创建一个或多个虚拟CPU，在一个POSIX线程上运行任务，处理VMEXIT事件，然后销毁虚拟CPU。当虚拟CPU被销毁后，终止POSIX线程，unmap内存region，并最终销毁VM。

# 参考

* [Hypervisor](https://developer.apple.com/documentation/hypervisor)