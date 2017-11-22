# 说明

在CentOS 5操作系统环境中编译`libvirt`时候

```
sudo yum install pkgconfig gettext dnsmasq radvd iptables ebtables \
rpm-build cmake lvm2 nfs-utils scrub numad augeas \
libpcap-devel libattr-devel libpciaccess-devel cyrus-sasl-devel \
libselinux-devel python-devel readline-devel libgcrypt-devel gnutls \
avahi-devel dbus-devel numactl-devel audit-libs-devel libxml2-devel \
gnutls-devel python-devel iscsi-initiator-utils device-mapper-devel \
xhtml1-dtds.noarch libblkid-devel augeas-devel sanlock-devel libnl3-devel \
polkit-devel lvm2-devel parted-devel librados2-devel librbd1-devel \
glusterfs-api-devel libcap-ng-devel fuse-devel netcf-devel libcurl-devel
```

> 实际编译rpm包的话可以先下载SRPM，然后通过`yum-builddep <libvirt.xxxx.src.rpm>`安装所有以来的开发软件包。参考 [通过yum-builddep安装所有从SRPM编译RPM包所依赖软件包](../../../os/linux/redhat/package/install_yum_build_dependencies_with_yum-builddep)

需要升级系统的automake和autoconf版本，否则报错：

```
+ cd libvirt-kvm-0.1
+ echo aclocal
aclocal
+ aclocal -I /usr/share/aclocal -I ./gnulib/m4/
aclocal:configure.ac:36: warning: macro `AM_SILENT_RULES' not found in library
aclocal:configure.ac:141: warning: macro `AM_PROG_LIBTOOL' not found in library
aclocal:configure.ac:146: warning: macro `AM_PROG_LD' not found in library
aclocal:configure.ac:2146: warning: macro `AM_GNU_GETTEXT_VERSION' not found in library
aclocal:configure.ac:2147: warning: macro `AM_GNU_GETTEXT' not found in library
```

需要独立安装[yail](https://github.com/bhimsen92/YAIL) （一个解释语言）否则报错：

```
checking for yajl_parse_complete in -lyajl... no
checking for yajl_tree_parse in -lyajl... no
configure: error: You must install the libyajl library & headers to compile libvirt
```

[yajl](https://lloyd.github.io/yajl/)是一个JSON库，在编写ANSI C处理JSON时需要。

```
git clone git://github.com/lloyd/yajl
cd yajl
./configure --prefix=/usr
make
sudo make install
```

> 最初想升级系统默认的gcc 4.1.2到4.4系列，所以采用了如下方法。但是，实践发现编译时存在变量校验的一些兼容问题，所以还是恢复原来的 gcc 4.1.2

```
sudo yum install gcc44 gcc44-c++
sudo rpm -e gcc-4.1.2-55.el5 gcc-c++-4.1.2-55.el5
cd /usr/bin
sudo ln -s gcc44 gcc
sudo ln -s gcc44 cc
sudo ln -s g++44 g++
```

https://sourceware.org/binutils/docs-2.27/ld/index.html ，这个软件包位于`binutils`

```
wget http://ftp.gnu.org/gnu/binutils/binutils-2.29.tar.gz
tar xfz binutils-2.29.tar.gz
cd binutils-2.29
./configure --prefix=/usr
make
sudo make install
```

编译`yajl`

```
git clone git://github.com/lloyd/yaj
cd yajl
./configure --prefix=/usr
make
sudo make install
```

> 编译需要`cmake`

* 需要kvm

```
checking linux/kvm.h usability... no
checking linux/kvm.h presence... no
checking for linux/kvm.h... no
configure: error: Required kernel features for LXC were not found
error: Bad exit status from /home/admin/libvirt-kvm-build/rpmbuild/build/tmp/rpm-tmp.3809 (%build)
```

参考[Re: [libvirt-users] kvm.h not found](https://www.redhat.com/archives/libvirt-users/2011-May/msg00088.html) 可能需要按照以下方式编译

```
CFLAGS=-I/home/compuser/linux-2.6.32.40/include ./configure
```

可以将kernel源代码解压缩到某个目录下，然后通过`/etc/profile`中添加CFALGS来解决：

```
CFLAGS="-I/data/linux-2.6.32-358.23.2.el5/include -Wno-error"
export CFLAGS
```

