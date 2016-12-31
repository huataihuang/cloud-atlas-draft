# 实践线路图

通过本文的实践，完整部署一套KVM运行环境用于测试，并实践一些基础运维：

* 在两台物理服务器的CentOS 7系统中部署KVM运行环境
* 采用Btrfs作为存储卷管理来部署KVM镜像所使用的文件系统，以灵活划分存储，充分利用存储资源
* 对Guest虚拟机进行clone，通过自定义镜像批量创建虚拟机
* 动态调整虚拟机的可用内存和vCPU
* 将NAT虚拟机端口映射对外提供服务访问
* 通过共享存储架构热迁移KVM虚拟机
* 通过Pacemaker实现高可用的KVM虚拟机



# 参考 

* [UnixArena KVM系列教程](http://www.unixarena.com/category/redhat-linux/linux-kvm) 的个人实践，撰写成 「KVM startup in Action」