# 找到系统尚未安装的工具命令属于哪个rpm包

经常会在需要使用某个工具软件的时候，不知道应该安装哪个rpm软件包。虽然 [rpm.pbone.net](http://rpm.pbone.net/) 提供了在线搜素软件包的功能，不过，对于使用YUM管理的服务器，实际上可以通过`yum provides`命令来找到对应软件包，或者使用`yum whatprovides`命令。

以下举例寻找哪个软件包提供了命令`lssubsys`

```bash
yum provides lssubsys

yum whatprovides lssubsys
```

输出显示

```bash
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: ftp.sjtu.edu.cn
 * extras: ftp.sjtu.edu.cn
 * updates: mirrors.skyshe.cn
base/7/x86_64/filelists_db                               | 6.2 MB     00:11
extras/7/x86_64/filelists_db                             | 258 kB     00:01
updates/7/x86_64/filelists_db                            | 1.9 MB     00:04
libcgroup-tools-0.41-8.el7.x86_64 : Command-line utility programs, services and
                                  : daemons for libcgroup
Repo        : base
Matched from:
Filename    : /usr/bin/lssubsys
```

可以看到`lscgroup-tools`软件包提供了该工具命令。

> 参考[How to find out which package a file belongs to?](http://unix.stackexchange.com/questions/4705/how-to-find-out-which-package-a-file-belongs-to)

# yum使用代理服务器

有时候需要使用[polipo](../../../../service/proxy/polipo.md)这样的代理服务器访问internet资源，如果需要使用yum安装软件包，可以设置环境变量`http_proxy`来实现安装：

```bash
export http_proxy="http://PROXY_IP:8123"
yum upgrade
yum install XXXX
```