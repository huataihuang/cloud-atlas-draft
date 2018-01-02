在编译RPM包的时候，如果要为不同操作系统平台准备编译和构建RPM包的环境是非常麻烦的事情。

Fedora项目释出的[Koji](https://fedoraproject.org/wiki/Koji)项目提供了在统一的平台利用[Mock](https://github.com/rpm-software-management/mock)构建chroot环境，以便能够实现针对不同OS架构和版本编译rpm包的方法。

Fedora还有一个[Copr](https://docs.pagure.org/copr.copr/index.html)项目也同样提供了rpm编译的平台。这个工具是社区使用的编译服务。

> [Copr in the Modularity World](https://blog.samalik.com/copr-in-the-modularity-world/) 介绍了Koji和Copr的区别

[怎么在 Fedora 中创建我的第一个 RPM 包？ ](http://chuansong.me/n/2027555733126)这篇文章介绍了如何在社区中采用copr构建包，并使用koji来托管。这是一个尝试做社区包维护工作的介绍。



# 参考

* [How can I build an RPM for CentOS 5 with CentOS 6?](https://www.centos.org/forums/viewtopic.php?t=46023)
* [Mock](https://github.com/rpm-software-management/mock/wiki)