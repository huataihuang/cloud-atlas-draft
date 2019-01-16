> 本文是个人最小化安装debian之后，构建基本的基础软件包：

* 安装gcc/gmake等基本编译工具
* 安装git版本管理
* 安装pyton/ruby等工具

```bash
apt-get install tmux wget bzip2 sysstat unzip nfs-common ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python ruby
```

或者使用screen(更为通用)，并且不安装ruby

```bash
apt-get install screen wget bzip2 sysstat unzip nfs-common ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python
```

> 对于[在Android上部署Linux](../../../../develop/android/linux/deploy_linux_on_android.md)，由于是采用chroot方式运行，所以无法运行`nfs`服务，就不要安装`nfs-common`软件包（相应也不安装 `rpcbind` 软件包）