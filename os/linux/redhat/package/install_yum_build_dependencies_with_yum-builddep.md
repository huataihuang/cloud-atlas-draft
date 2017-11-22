> 在没有知晓这个工具之前，编译一个rpm包的时候，非常痛苦 -- 通过一次次尝试，探索出编译某个软件所依赖的`xxx-devel`软件包，并一一手工安装 -- 效率及其低下。然而，终于发现了这个工具...

在`yum-utils`软件包中提供了一个`yum-builddep`工具，这个工具可以安装所有从SRPM编译RPM包所需要的依赖软件包：

```
yum-builddep <package name>
```

> 注意：这个`<package name>`对应的源代码RPM(SRPM)必须位于yum仓库或者本地源代码SRPM包。(请参考[从源代码ROM（SRPM）编译RPM包](rebuild_rpm_from_srpm))
>
> 不过，我测试的方法，似乎时在

# 安装举例

> 以下以编译`libvirt`软件包为例：

* 首先下载libvirt源代码RPM

```
yumdownloader --source libvirt
```

> 也遇到非常奇怪的报错

```
Loaded plugins: fastestmirror
No source RPM found for libvirt-0.8.2-29.el5_9.1.i386
No source RPM found for libvirt-0.8.2-29.el5_9.1.x86_64
```

只好手工下载srpm `wget http://vault.centos.org/5.11/os/Source/libvirt-0.8.2-29.el5_9.1.src.rpm`，效果是一样的

* 执行分析安装以来的编译软件

```
sudo yum-builddep libvirt-0.8.2-29.el5_9.1.src.rpm
```

系统将自动找到对应的依赖编译包

# 在CentOS 5上尝试安装CentOS 6的SRPM（失败）

* CentOS 5不能使用CentOS 6的SRPM包进行分析安装对应的依赖软件包

由于CentOS 6的软件包的打包签名方法改成了SHA1，和原有的CentOS 5签名使用的MD5不兼容，会出现如下报错

```
warning: rpmts_HdrFromFdno: Header V3 RSA/SHA1 signature: NOKEY, key ID c105b9de
...
um.Errors.MiscError: Could not open local rpm file: libvirt-0.10.2-62.el6.src.rpm
```

则采用忽略

```
yum --nogpgcheck localinstall libvirt-0.10.2-62.el6.src.rpm
```

依然报错

```
Examining libvirt-0.10.2-62.el6.src.rpm: libvirt-0.10.2-62.el6.src
Cannot add package libvirt-0.10.2-62.el6.src.rpm to transaction. Not a compatible architecture: src
Nothing to do
```

尝试采用rpm安装

```
$ sudo rpm -ivh libvirt-0.10.2-62.el6.src.rpm 
warning: libvirt-0.10.2-62.el6.src.rpm: Header V3 RSA/SHA1 signature: NOKEY, key ID c105b9de
   1:libvirt                warning: user mockbuild does not exist - using root
warning: group mockbuild does not exist - using root
########################################### [100%]
error: unpacking of archive failed on file /usr/src/redhat/SOURCES/libvirt-0.10.2.tar.gz;5a14f4ca: cpio: MD5 sum mismatch
```

由于显示MD5 sum mismatch，所以改为忽略MD5报错强制安装，不过依然没有成功

```
rpm -ivh --nomd5 libvirt-0.10.2-62.el6.src.rpm
```

# 参考

* [Installing yum build dependencies with yum-builddep](https://possiblelossofprecision.net/?p=949)

