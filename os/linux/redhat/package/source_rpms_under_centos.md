在RHEl/CentOS维护工作中，需要对部署的软件源代码debug，或者自己编译定制软件包。本文是安装`syslog-ng`源代码，debug解决[systemd环境syslog-ng启动问题](../../log/syslog-ng_3.5_fails_with_systemctl.md)的源代码安装记录。

虽然可以在稳定的CentOS中自己来下载和编译自己的软件包，但是会`breaking`标准配置。本文是通过有效安全地下载源代码，并且不需要使用root权限，这样就不会影响系统。

# 准备软件包

如果对于源代码有兴趣并且要做开发，可以安装开发包：

```
yum groupinstall "Development Tools"
```

> 上述开发工具集包含了必要的工具，包括`yumdownloader`。如果只是需要安装`yumdownloader`，则可以单独安装`yum-utils`

```
yum install yum-utils
```

> 注意：从Fedora 22开始，`dnf`替代了`yum`作为包管理工具（虽然依然可以使用`yum`命令，但是推荐转换成`dnf`)，`dnf`包管理工具今后将逐步取代`yum` - [使用dnf管理软件包](manage_package_with_dnf.md)
>
> 使用`dnf`包管理器的时候不需要安装`yum-utils`，可以用`dnf download`来代替`yumdownloader`

# 安装软件包的源代码包

* 首先查看提供命令的软件包，例如`syslog-ng`命令的软件包

```
rpm -qf /sbin/syslog-ng
```

* 设置yum repo文件的源

CentOS默认没有激活源代码包的仓库，不过配置文件在`/etc/yum.repos.d/`目录系都已存储，需要修改`source.repo`。例如，对于`Fedora`，修改`fedora.repo`将`enabled=0`修改成`enabled=1`

```
[fedora-source]
name=Fedora $releasever - Source
failovermethod=priority
#baseurl=http://download.fedoraproject.org/pub/fedora/linux/releases/$releasever/Everything/source/SRPMS/
metalink=https://mirrors.fedoraproject.org/metalink?repo=fedora-source-$releasever&arch=$basearch
enabled=1
metadata_expire=28d
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-$releasever-$basearch
skip_if_unavailable=False
```

* 下载源代码rpm包 - 这里不需要使用root帐号，普通用户帐号就可以

```
yumdownloader --source syslog-ng
```

对于使用`dnf`包管理工具的Fedora系统，可以使用

```
dnf download --source syslog-ng
```

此时会在当前目录下下载好 `syslog-ng-3.6.2-3.fc23.src.rpm` 软件包

* `rpm2cpio`检查软件包文件

```
rpm2cpio syslog-ng-3.6.2-3.fc23.src.rpm | cpio -it
```

可以看到输出rpm包中的内容

```
syslog-ng-3.3.6-tests-functional-sql-test.patch
syslog-ng-3.4.0beta1-tests-functional-control.py.patch
syslog-ng-3.6.2-syslog-ng.service.patch
syslog-ng.conf
syslog-ng.logrotate
syslog-ng.spec
syslog-ng_3.6.2.tar.gz
6347 blocks
```

注意上述rpm包中显示有一系列的patch包文件需要在编译之前先给代码打上补丁，所以在实际编译之前，还需要一些技巧来完成所需工作。

# 创建RPM构建环境

要实现安装，准备和构建源代码RPM文件，首先创建一个本地目录用于保存输出结果：

```
mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
```

然后配置`rpm`命令使之知晓对应目录

```
echo '%_topdir %(echo $HOME)/rpmbuild' > ~/.rpmmacros
```

接下来就可以将`syslog-ng`源代码分离出来

# 安装源代码

和常规RPM文件不同（常规RPM包的文件是安装到系统的各个目录下），源底码RPM文件是安装到你配置的rpm安装目录的。当前创建的`rpmbuild`目录还是空的

```
find rpmbuild
```

显示输出：

```
rpmbuild
rpmbuild/BUILD
rpmbuild/RPMS
rpmbuild/SOURCES
rpmbuild/SPECS
rpmbuild/SRPMS
```

现在开始安装源代码包

```
rpm -ivh syslog-ng-3.6.2-3.fc23.src.rpm
```

安装完成后再检查`rpmbuild`目录就可以看到对应文件都已经安装到这个目录下了

```
find rpmbuild
```

显示输出

```
rpmbuild/
rpmbuild/BUILD
rpmbuild/RPMS
rpmbuild/SOURCES
rpmbuild/SOURCES/syslog-ng-3.3.6-tests-functional-sql-test.patch
rpmbuild/SOURCES/syslog-ng-3.4.0beta1-tests-functional-control.py.patch
rpmbuild/SOURCES/syslog-ng-3.6.2-syslog-ng.service.patch
rpmbuild/SOURCES/syslog-ng.conf
rpmbuild/SOURCES/syslog-ng.logrotate
rpmbuild/SOURCES/syslog-ng_3.6.2.tar.gz
rpmbuild/SPECS
rpmbuild/SPECS/syslog-ng.spec
rpmbuild/SRPMS
```

# `rpmbuild`

需要安装`rpm-build`软件包来获取`rpmbuild`命令(这里需要使用root权限) -  使用`yum`或`dnf`安装

```
yum install rpm-build
```

# 使用`rpmbuild`处理spec文件

在`rpmbuild/SPECS`目录下有每个源代码编译对应的`.spec`，例如`rpmbuild/SPECS/syslog-ng.spec`

```
rpmbuild -bp syslog-ng.spec
```

> 编译`syslog-ng`还需要如下软件包：`GeoIP-devel bison eventlog-devel flex glib2-devel hiredis-devel ivykis-devel json-c-devel libcap-devel libdbi-dbd-sqlite libdbi-devel libesmtp-devel libmongo-client-devel libnet-devel libtool libuuid-devel openssl-devel pcre-devel riemann-c-client-devel systemd-devel tcp_wrappers-devel`

# 参考

* [Working with source RPMs under CentOS](http://crashcourse.ca/content/working-source-rpms-under-centos)