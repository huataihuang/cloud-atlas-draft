# 如何构建 LFS 系统

LFS 系统需要在一个已经安装好的 Linux 发行版（比如 Debian、OpenMandriva、Fedora 或 OpenSUSE）中构建。这个已有的 Linux 系统（即宿主）作为构建新系统的起始点，提供了必要的程序，包括一个编译器、链接器和 shell。请在安装发行版的过程中选择 “development（开发）”选项以便使用这些开发工具。

除了将一个独立发行版安装到你的电脑上之外，你也可以使用商业发行版的 LiveCD。

例如使用LiveCD，可以通过[转换ISO文件为启动U盘](https://www.linux.com/blog/how-burn-iso-usb-drive)，然后启动笔记本电脑，再通过这个U盘运行的Ubuntu系统来编译安装LFS：

```
sudo dd bs=4M if=xubuntu-16.04.3-desktop-amd64.iso of=/dev/sdb
```

然后使用Live-CD启动电脑作为host主机，安装相应的编译工具链，进行LFS部署。

不过，我实际采用了在[U盘中安装XUbtunu系统](../ubuntu/install/install_ubuntu_to_usb_stick)的方法来实现host主机。

注意：host主机需要安装好必要的编译工具，以下是我在最小化安装Ubuntu之后安装的软件包：

```
apt-get install wget bzip2 sysstat unzip nfs-common ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake
```

# 资源

如果通过 FAQ 不能解决你遇到的问题，接下来你可以搜索邮件列表： http://www.linuxfromscratch.org/search.html。 

对于不同列表中的信息，如何订阅，归档，以及额外信息，请访问 http://www.linuxfromscratch.org/mail.html。 

LFS 项目在世界范围内有许多镜像站点，方便大家访问我们的网站以及下载所需文件。请访问 LFS 站点 http://www.linuxfromscratch.org/mirrors.html 查看最新的镜像站点列表。 