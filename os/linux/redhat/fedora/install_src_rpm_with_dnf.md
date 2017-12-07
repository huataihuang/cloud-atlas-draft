当需要基于开源软件开发时，需要安装源代码。Fedora提供了非常方便的安装方法，即dnf安装src rpm方法。

> 本文是`non-root`用户安装软件包，需要安装工具包`rpmdevtools`，并且需要`rpmbuild`来构建源代码树。

> 案例是构建`libvirt`开发环境

* 下载源代码包

```
dnf download --source libvirt
```

如果是`yum-utils`则使用`yumdownloader --source libvirt`

> 将在当前用户目录下下载`libvirt`源代码包

* 创建一个rpm开发目录结构

```
rpmdev-setuptree
```

该命令将在用户的HOME目录下创建一个`~/rpmbuild`目录

* 安装源代码包

```
rpm -ivh libvirt-3.7.0-2.fc27.src.rpm
```

> 这里有一个提示`warning: user mockbuild does not exist - using root`

注意：上述安装指令不需要`root`权限，源代码包会直接安装到用户目录中刚才创建的`~/rpmbuild`目录下。例如，软代码位于`~/rpmbuild/SOURCES/libvirt-3.7.0.tar.xz`以及一些patch。

* 为了能够正确编译rpm包，需要相应的开发工具，`dnf`提供了一个`builddep`命令可以针对某个源代码软件包安装所有依赖的工具软件：

```
sudo dnf builddep libvirt
```

如果是`yum-utils`则使用`sudo yum-builddep libvirt`

* 检查`~/rpmbuild/SPECS`，然后解压缩源代码和apply补丁

```
rpmbuild -bp ~/rpmbuild/SPECS/libvirt.spec
```

> `-bp`表示把tar包解压缩，然后把所有的补丁文件合并而生成一个完整的最新功能的源代码 - 参考[RPM 打包技术与典型 SPEC 文件分析](https://www.ibm.com/developerworks/cn/linux/l-rpm/)
>
> 补丁后的源代码位于`~/rpmbuild/BUILD/libvirt-3.7.0`目录下

请检查`rpmbuild --help`或者`man rpmbuild`

* 编译成功之后，可以通过以下命令安装

```
sudo dnf install -y ~/rpmbuild/x86_64/libvirt*.rpm
```

> 详细编译方法参考[使用src rpm编译libvirt](../../../../virtual/libvirt/develop/build_from_libvirt_src_rpm)

# 参考

* [How do I install a src rpm with dnf?](https://ask.fedoraproject.org/en/question/87205/how-do-i-install-a-src-rpm-with-dnf/)