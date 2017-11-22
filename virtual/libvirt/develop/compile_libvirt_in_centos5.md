> CentOS 5平台比较陈旧，在编译libivrt的时候需要一些调整

# 编译工具准备

* 以下是依赖的库和工具

```
sudo yum install pkgconfig gettext dnsmasq radvd iptables ebtables \
rpm-build cmake lvm2 xhtml1-dtds.noarch nfs-utils scrub numad augeas \
libpcap-devel libattr-devel libpciaccess-devel cyrus-sasl-devel \
libselinux-devel python-devel readline-devel libgcrypt-devel gnutls \
avahi-devel dbus-devel numactl-devel audit-libs-devel libxml2-devel \
gnutls-devel python-devel iscsi-initiator-utils device-mapper-devel \
libblkid-devel augeas-devel sanlock-devel libnl3-devel polkit-devel \
lvm2-devel parted-devel librados2-devel librbd1-devel glusterfs-api-devel \
libcap-ng-devel fuse-devel netcf-devel libcurl-devel 
```

> 其他可能需要安装的还有`blkid`（CentOS 5没有该软件包，需要独立编译安装），如果是CentOS 6/7则安装`libblkid-devel`；CentOS 5没有`numad`

> Debian平台编译`libvirt`有一个批量安装依赖软件包的方法：`apt-get build-dep libvirt`

在CentOS平台，yum有一个针对编译源代码软件包的工具`yum-builddep`，这个工具位于`yum-utils`包。详细请参考[通过yum-builddep安装所有从SRPM编译RPM包所依赖软件包](../../../../os/linux/redhat/package/install_yum_build_dependencies_with_yum-builddep)

# 升级编译工具

* (这步跳过)最初将默认的gcc 4.1.2 更改为 4.4，如下所示。但是发现源代码中存在一些兼容问题，所以还是回滚到原始默认的gcc 4.1.2。以下操作方法仅供参考：

```
sudo yum install gcc44 gcc44-c++
sudo rpm -e gcc-4.1.2-55.el5 gcc-c++-4.1.2-55.el5
cd /usr/bin
sudo ln -s gcc44 gcc
sudo ln -s gcc44 cc
sudo ln -s g++44 g++
```

* 升级`binutils`（升级`ld`）
https://sourceware.org/binutils/docs-2.27/ld/index.html ，这个软件包位于`binutils`

```
wget http://ftp.gnu.org/gnu/binutils/binutils-2.29.tar.gz
tar xfz binutils-2.29.tar.gz
cd binutils-2.29
./configure --prefix=/usr
make
sudo make install
```

* 编译`yajl` - CentOS 7直接带了`yajl-devel`，但是CentOS 5没有该软件包，需要单独安装

```
git clone git://github.com/lloyd/yaj
cd yajl
./configure --prefix=/usr
make
sudo make install
```

> 编译需要`cmake`

* 升级`autoconf`和`automake` - **重要**：`libvirt`源代码包中`configure.ac`要求`autoconf`版本 - 参考 [升级CentOS 5系统的autoconf和automake工具](../../../os/linux/redhat/package/update_automake_autoconf_in_centos5)

```
wget http://ftp.gnu.org/gnu/autoconf/autoconf-2.69.tar.gz
tar xfz autoconf-2.69.tar.gz
cd autoconf-2.69
./configure --prefix=/usr
make
sudo make install

wget http://ftp.gnu.org/gnu/automake/automake-1.15.1.tar.gz
tar xfz automake-1.15.1.tar.gz
cd automake-1.15.1
./configure --prefix=/usr
make
sudo make install

wget http://invisible-island.net/datafiles/release/byacc.tar.gz
cd byacc-20170709
./configure --prefix=/usr
make
sudo make install

wget http://ftp.gnu.org/gnu/binutils/binutils-2.29.tar.gz
tar xfz binutils-2.29.tar.gz
cd binutils-2.29
./configure --prefix=/usr
make
sudo make install
```

* 安装Python - **重要**: CentOS 5的Python不支持KVM（当时的RHEL仅支持XEN），所以需要自己编译和安装独立版本的Python - 参考 [在古老的CentOS 5上安装Python 2.7以及virtualenv环境](../../../develop/python/startup/install_python_2.7_and_virtualenv_in_centos_5)

```
yum update
yum groupinstall -y "development tools"
yum install -y zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gdbm-devel db4-devel libpcap-devel xz-devel expat-devel
yum install -y wget

wget http://python.org/ftp/python/2.7.14/Python-2.7.14.tar.xz
tar xf Python-2.7.14.tar.xz
cd Python-2.7.14
./configure --prefix=/usr/local --enable-unicode=ucs4 --enable-shared LDFLAGS="-Wl,-rpath /usr/local/lib"
make && sudo make altinstall
```

> 注意：`libvirt`的`./configure`有一个参数可以指定使用的python路径，务必指向正确位置，例如 `./configure ... PYTHON="/usr/local/bin/python"`

此外，需要观察`libvirt`的`./configure`输出信息中支出的`${prefix}`和`${exec_prefix}`路径，默认是`/usr`，所以需要对应建立软链接以便能够找到Python的头文件和`site-packages`模块路径：

```
sudo ln -s /usr/local/lib/python2.7 /usr/lib/python2.7
sudo ln -s /usr/local/include/python2.7 /usr/include/python2.7
```

（可选）安装pip：

```
wget https://bootstrap.pypa.io/get-pip.py
sudo python2.7 get-pip.py
```

# 准备内核源码头文件

CentOS 5时代还没有内建支持`kvm`，所以虽然可以安装`kernel-devel`软件包获得内核头文件，但是实际上没有包含`kvm.h`或者`lxc.h`等。

实际采用从CentOS 6反向移植的Kernel 2.6.32系列内核源码来实现（可以在CentOS 5平台自己编译从CentOS 6移植过来的2.6.32系列内核），所以，可以从 kernel.org 下载源码，解压缩到 `/usr/src/kernels/`目录下。然后，为了能够让编译器找到头文件，在`/etc/profile`中添加

```bash
CFLAGS="-I/usr/src/kernels/linux-2.6.32-358.23.2.el5/include -Wno-error"
export CFLAGS
```

> 这里`-Wno-error`不是必须的，只是为了抑制一些不完善的定制代码引入的warning导致的编译终端。详见[gcc编译显示"cc1: warnings being treated as errors"处理方法](../../../develop/c/compile/gcc_warnings_being_treated_as_errors)

# 开始编译

```
aclocal -I /usr/share/aclocal -I ./gnulib/m4/
autoheader
automake --add-missing
autoconf

./configure --prefix=/usr ......
```

----

# 一些报错信息和对应处理方法

* 需要升级系统的automake和autoconf版本，否则报错：

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

* 需要安装yajl，否则报错：

```
checking for yajl_parse_complete in -lyajl... no
checking for yajl_tree_parse in -lyajl... no
configure: error: You must install the libyajl library & headers to compile libvirt
```

* 需要kvm.h

```
checking linux/kvm.h usability... no
checking linux/kvm.h presence... no
checking for linux/kvm.h... no
configure: error: Required kernel features for LXC were not found
error: Bad exit status from /home/admin/libvirt-kvm-build/rpmbuild/build/tmp/rpm-tmp.3809 (%build)
```

参考[Re: [libvirt-users] kvm.h not found](https://www.redhat.com/archives/libvirt-users/2011-May/msg00088.html) 介绍了解决方法：

```
CFLAGS=-I/home/compuser/linux-2.6.32.40/include ./configure
```

实际操作是采用内核源代码安装：可以从 kernel.org 下载内核源代码，或者参考 [我需要内核的源代码](https://wiki.centos.org/zh/HowTos/I_need_the_Kernel_Source) 的方法安装操作系统内核源代码。不过，CentOS 5内核尚未引入kvm，实际采用的是CentOS 6的kernel 2.6.32系列内核源代码

```
tar xfz linux-2.6.32-358.23.2.el5.tar.gz
sudo mv linux-2.6.32-358.23.2.el5 /usr/src/kernels/

cd /usr/src/kernels/
ln -s linux-2.6.32-358.23.2.el5 linux
```

如果是在CentOS 6平台编译，则只需要安装 `kernel-headers` 软件包就可以，以下是提示信息

```
configure: error: You must install kernel-headers in order to compile
libvirt with QEMU or LXC support
```

如果安装了`kernel-headers`或者内核源代码之后依然出现报错，则检查上述`/home/admin/libvirt-kvm-build/rpmbuild/build/tmp/rpm-tmp.3809`日志可以看到编译环境参数中有：

```
  CFLAGS="${CFLAGS:--O2 -g -m64 -mtune=generic}" ; export CFLAGS ;
  CXXFLAGS="${CXXFLAGS:--O2 -g -m64 -mtune=generic}" ; export CXXFLAGS ;
  FFLAGS="${FFLAGS:--O2 -g -m64 -mtune=generic}" ; export FFLAGS ;
```

所以解决的方法是先在shell中执行（或者在`/etc/profile`中添加）：

```
CFLAGS="-I/usr/src/kernels/linux-2.6.32-358.23.2.el5/include"
export CFLAGS
```

然后再次执行编译就可以

* 编译中的warning导致编译失败的处理：

对于一些不重要的warning（某些定制引入的次要错误可忽略），如定义变量未使用，如果引发了编译失败（默认gcc编译参时是`cc1: warnings being treated as errors`），可以通过设置`CFLAGS`环境变量（修改`/etc/profile`）:

```
CFLAGS="-I/usr/src/kernels/linux-2.6.32-358.23.2.el5/include -Wno-error"
export CFLAGS
```

> 详细参考 [gcc编译显示"cc1: warnings being treated as errors"处理方法](../.../../../develop/c/compile/gcc_warnings_being_treated_as_errors)

