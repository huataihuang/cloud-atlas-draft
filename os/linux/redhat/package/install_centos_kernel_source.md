# 如果只是编译内核驱动程序（模块）

如果需要编译一个内核的驱动程序（模块），很可能并不需要安装整个内核源代码。也许只需要安装 kernel-devel 这个组件。

安装 kernel-devel 组件：

```
yum install kernel-devel
```

如果内核因为来自较旧的目录树而未被 `yum` 列出，可以手动式地从 [CentOS Vault](http://vault.centos.org/) 下载它

> CentOS-7：请在 `7.N.YYMM/os/x86_64/Packages/` 或 `7.N.YYMM/updates/x86_64/Packages/` 目录内找寻 `kernel-devel-版本.x86_64.rpm`
>
> CentOS-6：请在 `6.N/os/arch/Packages/` 或 `6.N/updates/arch/Packages/` 目录内找寻 `kernel-devel-版本.结构.rpm`

当你安装了合适的 `kernel[-类型]-devel-版本.结构.rpm` 组件，请尝试编译你的模块。这样做是应该行得通的。假若事实并非如此，请提供反馈给模块的开发者，因为这是设计所有新内核模块时应采用的编译方式。 

# 准备工具

CentOS-7 执行

```
yum install rpm-build redhat-rpm-config asciidoc hmaccalc perl-ExtUtils-Embed pesign xmlto
yum install audit-libs-devel binutils-devel elfutils-devel elfutils-libelf-devel
yum install ncurses-devel newt-devel numactl-devel pciutils-devel python-devel zlib-devel
```

CentOS-6 执行

```
yum install rpm-build redhat-rpm-config asciidoc bison hmaccalc patchutils perl-ExtUtils-Embed xmlto
yum install audit-libs-devel binutils-devel elfutils-devel elfutils-libelf-devel
yum install newt-devel python-devel zlib-devel
```

# 下载和解压源代码

* 下载CentOS源代码 - 参考 [我需要内核的源代码](https://wiki.centos.org/zh/HowTos/I_need_the_Kernel_Source)，注意将`N`或`N.YYMM`替换成对应版本好
  * CentOS-6: http://vault.centos.org/6.N/os/Source/SPackages/ 或 http://vault.centos.org/6.N/updates/Source/SPackages/
  * CentOS-7: http://vault.centos.org/7.N.YYMM/os/Source/SPackages/ 或 http://vault.centos.org/7.N.YYMM/updates/Source/SPackages/

```
mkdir -p ~/rpmbuild/{BUILD,BUILDROOT,RPMS,SOURCES,SPECS,SRPMS}
echo '%_topdir %(echo $HOME)/rpmbuild' > ~/.rpmmacros
rpm -i http://vault.centos.org/6.3/os/Source/SPackages/kernel-2.6.32-279.el6.src.rpm 2>&1 | grep -v exist
```

* 解压缩和准备源代码文件

```
cd ~/rpmbuild/SPECS
rpmbuild -bp --target=$(uname -m) kernel.spec
```

> 在加压缩内核代码的时候，需要使用随机数生成器来实现签名，如果出现长时间停止在`+ gpg --homedir . --batch --gen-key`，则需要参考[随机数生成器RNG](../../device/random_number_generator)一文启用`rgnd`服务（加载对应的`rng`模块并）实现数字签名。

以上完成后，源代码目录位于`~/rpmbuild/BUILD/kernel*/linux*/`目录下可以找到。

# 参考

* [我需要内核的源代码](https://wiki.centos.org/zh/HowTos/I_need_the_Kernel_Source)