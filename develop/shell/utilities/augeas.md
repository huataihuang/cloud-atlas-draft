# Augeas简介

[Augeas](http://augeas.net/)是配置修改工具，通过API方式

默认schemas安装在`/usr/share/augeas/lenses`

为了避免误操作，在练习时，请创建一个沙盒来安全修改配置文件：

```bash
export AUGEAS_ROOT=/tmp/augeas-sandbox
mkdir $AUGEAS_ROOT
sudo cp -pr /etc $AUGEAS_ROOT
sudo chown -R $(id -nu):$(id -ng) $AUGEAS_ROOT
augtool -b
```

`-b`参数告诉`augtool`在修改文件时，用一个扩展名`.augsave`保留原始文件。

在`augtool` shell中，输入`help`可以获得命令列表，使用`print`可以探索tree上表达的数据。

# 安装

* rpm安装

```
yum install augeas
```

在启动`augeas`交互命令时，使用`errors`命令可以检查初始化环境是否存在问题，例如一些配置文件可能无法正确处理导致无法加载

```
augtool> errors
Error in /etc/libvirt/qemu.conf:289.0 (parse_failed)
  Iterated lens matched less than it should
  Lens: /usr/share/augeas/lenses/libvirtd_qemu.aug:101.13-.43:
    Last matched: /usr/share/augeas/lenses/libvirtd_qemu.aug:97.17-.31:

Error in /etc/sysconfig/network-scripts/ifcfg-eth2:11.0 (parse_failed)
  Syntax error
  Lens: /usr/share/augeas/lenses/dist/shellvars.aug:194.12-.60:
```

* 源代码安装 - 最新的源代码从github  https://github.com/hercules-team/augeas 获取

```
git clone https://github.com/hercules-team/augeas.git
cd augeas
./autogen.sh
./configure
make && make install
```

不过，在Red Hat/CentOS系统中，默认已经安装了 ``

# 在 `/etc/hosts`中添加内容

```
set /files/etc/hosts/01/ipaddr 192.168.0.1
set /files/etc/hosts/01/canonical pigiron.example.com
set /files/etc/hosts/01/alias[1] pigiron
set /files/etc/hosts/01/alias[2] piggy
save
```

此时在`/tmp/augeas-sandbox/etc/hosts`可以看到添加了一行记录

```
192.168.0.1	pigiron.example.com pigiron piggy
```

# 修改 /etc/grub.conf

augeas可以简化grub.conf配置方法，抽象出容易修改对象

```
set /files/etc/grub.conf/default 1
rm /files/etc/grub.conf/title[3]
save
```

# 交互案例

```bash
#augtool
ls augtool> ls /
augeas/ = (none)
files/ = (none)
augtool> print /files/etc/passwd/root/
/files/etc/passwd/root
/files/etc/passwd/root/password = "x"
/files/etc/passwd/root/uid = "0"
/files/etc/passwd/root/gid = "0"
/files/etc/passwd/root/name = "root"
/files/etc/passwd/root/home = "/root"
/files/etc/passwd/root/shell = "/bin/bash"
```

# 修改 /etc/hosts

```bash
#augtool -A
augtool> set /augeas/load/hosts/lens Hosts.lns
augtool> set /augeas/load/hosts/incl /etc/hosts
augtool> load
augtool> print /files/etc/hosts
/files/etc/hosts
/files/etc/hosts/1
/files/etc/hosts/1/ipaddr = "127.0.0.1"
/files/etc/hosts/1/canonical = "localhost"
/files/etc/hosts/1/alias = "localhost.localdomain"
/files/etc/hosts/2
/files/etc/hosts/2/ipaddr = "192.168.29.163"
/files/etc/hosts/2/canonical = "ex-01.labs"
/files/etc/hosts/2/alias = "ex-01"
```

# 修改 /etc/profile

# 修改 /etc/sysconfig/libvirtd

# 修改 /etc/libvirt/qemu.conf

```bash
augtool> print /files/etc/libvirt/
```

# 参考

* [Become a Configuration surgeon with Augeas](http://raphink.github.io/augeas-talks/#/overview)
* [Creating a lens step by step](https://github.com/hercules-team/augeas/wiki/Creating-a-lens-step-by-step)
* [Augeas: A quick tour](http://augeas.net/tour.html)
* [如何用Puppet和Augeas管理Linux配置](https://linux.cn/article-4300-1.html)
* [Using Augeas to Modify Configuration Files](https://elatov.github.io/2014/09/using-augeas-to-modify-configuration-files/)
* [5 minute introduction to Augeas (config file editing library)](https://rwmj.wordpress.com/2013/04/18/5-minute-introduction-to-augeas-config-file-editing-library/)