在编译RPM包的时候，如果要为不同操作系统平台准备编译和构建RPM包的环境是非常麻烦的事情。

Fedora项目释出的[Koji](https://fedoraproject.org/wiki/Koji)项目提供了在统一的平台利用[Mock](https://github.com/rpm-software-management/mock)构建chroot环境，以便能够实现针对不同OS架构和版本编译rpm包的方法。

`待实践`

# 参考

* [How can I build an RPM for CentOS 5 with CentOS 6?](https://www.centos.org/forums/viewtopic.php?t=46023)
* [Mock](https://github.com/rpm-software-management/mock/wiki)