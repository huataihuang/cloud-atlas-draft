# 准备libvirt编译环境

在[使用dnf安装源代码rpm](../../../os/linux/redhat/fedora/install_src_rpm_with_dnf)过程中，安装好了libvirt的源代码，并且相应安装了编译所需的环境：

```
dnf download --source libvirt
rpmdev-setuptree
rpm -ivh libvirt-3.7.0-2.fc27.src.rpm
sudo dnf builddep libvirt
```

> 此外，需要安装编译器gcc，所以执行

```
sudo dnf groupinstall -y "development tools"
```

## 手工安装libvirt编译环境

如果需要独立手工安装libvirt编译环境可以参考如下方法安装必要的编译开发依赖软件包：

```
yum install -y radvd libpcap-devel readline-devel iscsi-initiator-utils avahi-devel dbus-devel audit-libs-devel xhtml1-dtds gnutls-devel

yum install -y xmlto asciidoc hmaccalc newt-devel perl pesignelfutils-devel binutils-devel pciutils-devel

yum install -y pesign elfutils-devel perl-ExtUtils*

yum install -y glib2-devel iasl libuuid-devel texinfo cyrus-sasl cyrus-sasl-devel libpng-devel pixman pixman-devel perl perl-podlators numactl-devel libaio-devel

yum install -y yajl-devel.x86_64 libxml2-devel.x86_64 gnutls-devel.x86_64 device-mapper-devel.x86_64 libpciaccess-devel.x86_64 libnl-devel.x86_64

yum install -y wget gcc git gdb automake
```

# 编译libvirt

```
./autobuild.sh
```

如果自定义代码中有些不太完善的代码，可能会有编译报错，再通过以下方法忽略部分错误：

```bash
#!/bin/sh

if [ "$1" == "init" ]; then
	echo "aclocal"
	aclocal -I /usr/share/aclocal -I ./gnulib/m4/
	echo "autoheader"
	autoheader
	echo "automake"
	automake
	echo "autoconf"
	autoconf
	echo "start configure"
fi

./configure \
 --disable-rpath \
 --disable-static \
 --disable-werror \
 --enable-debug=no \
 --disable-werror\
 --with-qemu \
 --with-yajl \
 --prefix=/usr \
 --libdir=/usr/lib64 \
 --sysconfdir=/etc \
 --localstatedir=/var \
 --without-openvz \
 --without-vmware \
 --without-vbox \
 --with-python \
 --without-hyperv \
 --with-parallels \
 --with-numactl \
 --with-lxc \
 --without-libxl \
 --without-xen \
 --without-xenapi \
 --without-selinux \
 --with-gnutls \
 --with-remote \
 --with-init-script=redhat \
 --without-secdriver-selinux \
 --with-libvirtd \
 --with-macvtap \
 --with-sysctl \
 --with-driver-modules \
 --with-packager-version=test188 \
 LDFLAGS="-Wl,--as-needed" \
 PYTHON=/usr/bin/python
```

```bsh
make
make install
```

另外，需要手工复制python使用的库文件，否则python客户端无法操作

```
yes | cp ./python/.libs/libvirtmod.so /usr/local/python/lib/python2.7/site-packages/
yes | cp ./python/.libs/libvirtmod_qemu.so /usr/local/python/lib/python2.7/site-packages/
yes | cp ./python/libvirt.py /usr/local/python/lib/python2.7/site-packages/
yes | cp ./python/format_xml.py /usr/local/python/lib/python2.7/site-packages/
yes | cp ./python/libvirt_qemu.py /usr/local/python/lib/python2.7/site-packages/
```

## 编译报错处理

* `error: jump skips variable initialization [-Werror=jump-misses-init]`

编译libvirt报错：

```bash
../../src/util/viravs.c: In function 'virAvsRpcGetMigrateInfo':
../../src/util/viravs.c:382:9: error: jump skips variable initialization [-Werror=jump-misses-init]
         goto cleanup;
         ^
../../src/util/viravs.c:441:1: note: label 'cleanup' defined here
 cleanup:
 ^
../../src/util/viravs.c:428:9: note: 'info_len' declared here
     int info_len = strlen(migrate_info_tmp) + 1;
         ^
../../src/util/viravs.c:388:9: error: jump skips variable initialization [-Werror=jump-misses-init]
         goto cleanup;
         ^
```

代码部分:

```c
    if (json_cmd == NULL)
        goto cleanup;
        ...

cleanup:
    virJSONValueFree(reply);
    if (json_cmd)
        free(json_cmd);

    return ret;
}
```

在 `configure` 时使用参数 `--disable-werror` 可以忽略上述错误

# 编译libvirt的rpm包

以下是在Fedora 27平台编译`libvirt`的过程：

* 修订`~/rpmbuild/SPECS/libvirt.spec`，按照自己的需要修改如下：

> `0`表示`假`，`1`表示`真` - 这里有待检查

将以下配置修订

```
# The hypervisor drivers that run in libvirtd
%define with_xen           0%{!?_without_xen:1}
%define with_qemu          0%{!?_without_qemu:1}
%define with_lxc           0%{!?_without_lxc:1}
%define with_uml           0%{!?_without_uml:1}
%define with_libxl         0%{!?_without_libxl:1}
%define with_vbox          0%{!?_without_vbox:1}
```

修改成 - 只修改`with_qemu`一行，开启qemu支持和lxc支持（这里举例）

```
# The hypervisor drivers that run in libvirtd
%define with_xen           0%{!?_without_xen:1}
%define with_qemu          1%{!?_without_qemu:0}
%define with_lxc           1%{!?_without_lxc:0}
%define with_uml           0%{!?_without_uml:1}
%define with_libxl         0%{!?_without_libxl:1}
%define with_vbox          0%{!?_without_vbox:1}
```

> 注意：如果不修改spec文件，也可以在`rpmbuild`时候传递参数

```
rpmbuild -ba \
  --define '_with_qemu _with_lxc' \
  --define '_without_xen _without_uml _without_libxl _without_vbox' \
  libvirt.spec
```

> `-bb`表示只生成二进制的rpm包，`-bs`表示只生成src格式的rpm包，`-bp`表示只生成完整的源代码（即把tar包解开然后把所有的补丁文件合并生成一个完整的最新功能的源文件）。
>
> `-ba`则包含上述3个过程，分别生成的包，存放在相应的目录下。

* 编译生成二进制rpm包 - 

```
rpmbuild -bb libvirt.spec
```

以下只编译支持`qemu`

```
rpmbuild -bb \
    --define '_with_qemu' \
    --define '_without_lxc _without_xen _without_uml' \
    --define '_without_libxl _without_vbox' \
    libvirt.spec
```

# 手工编译安装

在调试代码的时候，需要激活`--enable-debug`

```
cd /home/admin/libvirt-kvm-build

./configure \
 --disable-rpath \
 --disable-static \
 --enable-debug=yes \
 --with-qemu \
 --with-yajl \
 --prefix=/usr \
 --libdir=/usr/lib64 \
 --sysconfdir=/etc \
 --localstatedir=/var \
 --without-openvz \
 --without-vmware \
 --without-vbox \
 --with-python \
 --without-hyperv \
 --with-parallels \
 --with-numactl \
 --with-lxc \
 --without-libxl \
 --without-xen \
 --without-xenapi \
 --without-selinux \
 --with-gnutls \
 --with-remote \
 --with-init-script=redhat \
 --without-secdriver-selinux \
 --with-libvirtd \
 --with-macvtap \
 --with-sysctl \
 --with-driver-modules \
 --with-packager-version=test123 \
 LDFLAGS="-Wl,--as-needed" \
 PYTHON=/usr/local/python/bin/python

make
```

编译以后，将libvirtd复制到线上进行测试

# 参考

* [编译qemu和libvirt使支持SDL](http://blog.csdn.net/jiuzuidongpo/article/details/44342509)
* [How can i get kvm rpm package which support ceph rbd for centos7 or rhel 7?](https://ask.openstack.org/en/question/59480/how-can-i-get-kvm-rpm-package-which-support-ceph-rbd-for-centos7-or-rhel-7/)
* [RPM 打包技术与典型 SPEC 文件分析](https://www.ibm.com/developerworks/cn/linux/l-rpm/)
* [RPM包rpmbuild SPEC文件深度说明](http://hlee.iteye.com/blog/343499)
* [关于rpm打包中的条件判断](http://www.linuxfly.org/post/137/)
* [Re: [libvirt] RPM spec file patch](https://www.redhat.com/archives/libvir-list/2011-November/msg00886.html)