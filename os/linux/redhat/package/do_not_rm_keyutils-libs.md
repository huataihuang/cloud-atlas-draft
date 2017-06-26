最近一次软件包更新，遇到一个包冲突问题，没有仔细检查就直接`rpm -e --nodeps keyutils-libs`删除了软件包`keyutils-libs`。结果发现，系统大多数登录，下载或ssh命令都依赖了这个软家包中的`/usr/lib64/libkeyutils.so.1.5`。（通过`ldd`命令可以看到相关命令都依赖这个动态链接库文件）

最后解决的方法是重启到无盘状态，然后从其他服务器复制需要的库文件来修复执行功能（还好这个rpm软件包只有一个实际使用的文件）

导致这个问题的原因是，定制的操作系统软件包版本号比CentOS提供的同名软件包版本号高。解决的方法是：

* 首先强制安装CentOS软件包（不卸载情况下覆盖安装）

```
rpm -ivh http://mirrors.163.com/centos/7/os/x86_64/Packages/keyutils-libs-1.5.8-3.el7.x86_64.rpm --force
rpm -ivh http://mirrors.163.com/centos/7/os/x86_64/Packages/keyutils-libs-devel-1.5.8-3.el7.x86_64.rpm --force
```

* 然后删除掉定制冲突的软件包rpm信息（但是不实际删除磁盘文件），使用参数`--justdb`

```
rpm -e keyutils-libs-1.5.8-3.1.alios7.x86_64 keyutils-libs-devel-1.5.8-3.1.alios7.x86_64 --justdb
```

* 之后检查验证系统就只有CentOS发行版的软件包信息，也就不再冲突，可以继续安装CentOS提供的相关软件

```
rpm -qa | grep keyutils-libs
```
