> 在Ubuntu操作系统实现nested virtualization，实现在虚拟机内部的虚拟化，可以帮助我们构建复杂的OpenStack集群。

> Ubuntu中使用KVM技术参考[Ubuntu环境KVM: 安装](../kvm_on_ubuntu/installation)

KVM支持虚拟化嵌套（Nested Virtualization），这样可以在KVM中运行KVM。

默认情况下，Linux发行版的内核没有激活嵌套虚拟化，这里


# 参考

* [Configure DevStack with KVM-based Nested Virtualization](https://docs.openstack.org/devstack/latest/guides/devstack-with-nested-kvm.html)