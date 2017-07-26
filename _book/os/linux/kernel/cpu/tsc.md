
# KVM和Xen

[KVM Guest时间管理](../../../../virtual/kvm/deployment_and_administration/kvm_guest_timing_management.md)介绍了如何在虚拟机中保持时间同步 - 从RHEL 5.5开始以及更新版本，RHEK 6以及更新版本，RHEL 7都使用`kvm-clock`作为自己默认的时钟源。如果不使用`kvm-clock`，则需要特殊的配置，并且不推荐使用非`kvm-clock`其他时钟源。


# 参考

* [Pitfalls of TSC usage](http://oliveryang.net/2015/09/pitfalls-of-TSC-usage/) EMC开发工程师Oliver(Yong) Yang撰写的x86平台使用TSC存在的坑，是非常好的经验参考
* [Timekeeping in VMware Virtual Machines](http://www.vmware.com/files/pdf/Timekeeping-In-VirtualMachines.pdf) VMware提供的技术文档
* [Linux 时钟管理](https://www.ibm.com/developerworks/cn/linux/l-cn-timerm/) - IBM developWorks网站提供的技术文档