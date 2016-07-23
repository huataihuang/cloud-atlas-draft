> 虽然RHEL/CentOS 6开始默认使用`rsyslog`作为系统日志服务，不过，也可以部署`syslog-ng`来替代。

* RHEL/CentOS 7需要从[EPEL](http://fedoraproject.org/wiki/EPEL)安装

```
rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
yum install syslog-ng
```

* 在Fedora中可以直接安装

```
yum install syslog-ng
```

安装了以下软件包

```
 eventlog          x86_64         0.2.13-7.fc23            fedora          24 k
 ivykis            x86_64         0.36.2-5.fc23            fedora          40 k
 libnet            x86_64         1.1.6-10.fc23            fedora          64 k
 syslog-ng         x86_64         3.6.2-3.fc23             fedora         492 k
```

* 检查版本

```
syslog-ng -V
```

输出信息

```
syslog-ng 3.6.2
Installer-Version: 3.6.2
Revision:
Compile-Date: Jun 19 2015 03:17:02
Available-Modules: affile,afprog,afsocket-notls,afsocket-tls,afsocket,afstomp,afuser,basicfuncs,confgen,cryptofuncs,csvparser,dbparser,graphite,linux-kmsg-format,pseudofile,sdjournal,syslogformat,system-source
Enable-Debug: off
Enable-GProf: off
Enable-Memtrace: off
Enable-IPv6: on
Enable-Spoof-Source: on
Enable-TCP-Wrapper: on
Enable-Linux-Caps: off
```

* 检查配置文件语法

```
syslog-ng --syntax-only
```

详细的检查

```
syslog-ng -Fevd
```

* 检查状态

```
syslog-ng-ctl stats
```

# 参考

* [SYSLOG-NG-CENTOS Step by Step Installation Guide](http://padfoot999.proboards.com/thread/148/syslog-centos-step-installation-guide)