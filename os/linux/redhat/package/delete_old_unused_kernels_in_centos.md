对于系统安装了多个内核，我们可能需要清理部分旧内核，以便释放 `/boot` 目录空间。

检查系统已经安装的内核

```bash
rpm -q kernel
```

# CentOS 7清理旧内核

CentOS 7提供了 `yum-utils` 可以集成到yum中帮助管理软件包

```bash
yum install yum-utils
```

* `package-cleanup` 可以删除旧内核:

```bash
package-cleanup --oldkernels --count=2
```

# CentOS 8清理旧内核

Fedora/CentOS 8使用了dnf，使用以下命令清理

```bash
dnf remove $(dnf repoquery --installonly --latest-limit 2 -q) 
```

# 参考

* [How to Delete Old Unused Kernels in CentOS, RHEL and Fedora](https://www.tecmint.com/delete-old-kernels-in-centos-rhel-and-fedora/)