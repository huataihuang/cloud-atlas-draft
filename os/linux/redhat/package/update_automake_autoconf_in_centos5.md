# 在CentOS 5环境编译libvirt的困扰

在CentOS 5编译lbivirt软件包时候遇到如下报错

```
+ aclocal -I /usr/share/aclocal -I ./gnulib/m4/
aclocal:configure.ac:36: warning: macro `AM_SILENT_RULES' not found in library
aclocal:configure.ac:141: warning: macro `AM_PROG_LIBTOOL' not found in library
aclocal:configure.ac:146: warning: macro `AM_PROG_LD' not found in library
aclocal:configure.ac:2146: warning: macro `AM_GNU_GETTEXT_VERSION' not found in library
...
```

参考 [Yubico/yubico-c: Unable to build #2](https://github.com/Yubico/yubico-c/issues/2) 上述报错是因为CentOS 5 `automake` 版本只有`1.9.6`，实际对于`AM_SILENT_RULES`需要`automake`版本`1.11`。所以考虑升级操作系统的`automake`和`autoconf`版本。

此外，要支持编译`libvirt`还需要以下软件包

```
sudo yum install pkgconfig gettext dnsmasq radvd iptables ebtables  libpcap-devel libattr-devel libpciaccess-devel cyrus-sasl-devel libselinux-devel python-devel readline-devel libgcrypt-devel gnutls avahi-devel dbus-devel numactl-devel audit-libs-devel cmake
```

> `cmake`是为了编译`libvirtd`编译时依赖的[yajl](https://lloyd.github.io/yajl/)

# 升级编译工具链

* （这步跳过）CentOS 5的默认gcc版本太低，可能会导致编译无法通过，改为系统提供的gcc44

```
sudo yum install gcc44 gcc44-c++
sudo rpm -e gcc-4.1.2-55.el5 gcc-c++-4.1.2-55.el5
cd /usr/bin
sudo ln -s gcc44 gcc
sudo ln -s gcc44 cc
sudo ln -s g++44 g++
```

* 升级编译以下编译工具

```
wget http://ftp.gnu.org/gnu/autoconf/autoconf-2.69.tar.gz
tar xfz autoconf-2.69.tar.gz
cd autoconf-2.69
./configure --prefix=/usr
make
sudo make install
```

```
wget http://ftp.gnu.org/gnu/automake/automake-1.15.1.tar.gz
tar xfz automake-1.15.1.tar.gz
cd automake-1.15.1
./configure --prefix=/usr
make
sudo make install
```

http://invisible-island.net/byacc/byacc.html 提供了最新的byacc版本信息 

```
wget http://invisible-island.net/datafiles/release/byacc.tar.gz
cd byacc-20170709
./configure --prefix=/usr
make
sudo make install
```

```
wget http://ftp.gnu.org/gnu/binutils/binutils-2.29.tar.gz
tar xfz binutils-2.29.tar.gz
cd binutils-2.29
./configure --prefix=/usr
make
sudo make install
```

> 这里`./configure --prefix=/usr`是为了覆盖发行版自带的`autoconf`和`automake`版本，既然CentOS 5已经终止更新，不如用自己编译的版本覆盖以避免编译问题。

# 参考

* [How to Install or Update autoconf and automake on RHEL/CentOS?](https://techglimpse.com/install-update-autoconf-linux-tutorial/)
* [Installing Berkeley Yet Another Compiler Compiler](https://geeksww.com/tutorials/miscellaneous/berkeley_yet_another_compiler_byacc/installation/installing_berkeley_yacc_ubuntu_linux.php)