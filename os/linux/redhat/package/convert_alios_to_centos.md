> 本文提供给需要将AliOS（类似CentOS的给予RHEL的发行版本）转换到标准社区CentOS的人做参考

# 转换到CentOS 7.8.2003

> 2020年6月，CentOS 7已经发布到 7.8.2003 。本段落是完整的操作步骤记录，请参考这段记录

* 卸载alios版本包

```bash
rpm -e --nodeps alios-release-server-7.2-23.alios7.x86_64
rpm -e alios-base-setup-7.2-33.alios7.noarch
rm -f /etc/yum.repos.d/CentOS-Base.repo
rm -f /etc/yum.repos.d/epel.repo
rm -f /etc/yum.repos.d/ops.repo
rm -f /etc/yum.repos.d/RHEL.repo
rm -f /etc/yum.repos.d/taobao.repo
```

有一个warning，不过，软件包还是删除了

```
warning: Unable to get systemd shutdown inhibition lock: Unit is masked.
```

* 导入证书

```bash
rpm --import http://mirrors.163.com/centos/7.8.2003/os/x86_64/RPM-GPG-KEY-CentOS-7
```

* 安装CentOS系统配置

```bash
rpm -ivh http://mirrors.163.com/centos/7.8.2003/os/x86_64/Packages/centos-release-7-8.2003.0.el7.centos.x86_64.rpm
```

* 删除 `taobao-repo-utils` 否则centos 的 yum报错

```
rpm -e taobao-repo-utils-2.1.0-5.noarch
rpm -e taobao-repo-utils-1.1.2-10.1.alios7.noarch
```

* 卸载dnf (alios 7.2引入了Fedora使用的dnf，但是和官方yum冲突)

```
rpm -e --nodeps \
dnf-conf-2.7.6-6.alios7.noarch \
libdnf-0.11.1-1.alios7.x86_64 \
python2-dnf-plugins-core-2.1.5-9.alios7.noarch \
python2-dnf-2.7.6-6.alios7.noarch \
dnf-2.7.6-6.alios7.noarch \
python2-dnf-plugin-show-leaves-2.1.5-9.alios7.noarch \
dnf-plugins-p2p-0.1.0-1.alios7.noarch \
dnf-plugins-core-2.1.5-9.alios7.noarch \
python2-dnf-plugin-leaves-2.1.5-9.alios7.noarch \
python2-dnf-plugin-versionlock-2.1.5-9.alios7.noarch \
dnf-utils-2.1.5-8.alios7.noarch
```

* 卸载yum (alios 7.2由于使用了dnf，导致yum实际是dnf的软连接，并且有很多残留包需要一并删除)

```
rpm -e --nodeps \
yum4-2.7.6-6.alios7.noarch \
yum-metadata-parser-1.1.4-10.1.alios7.x86_64 \
yum-baseline-hc-1.0.0-20200620.alios7.x86_64 \
yum-langpacks-0.4.2-4.1.alios7.noarch \
yum-plugin-fastestmirror-1.1.31-46.alios7.noarch \
yum-adapter-0.1.0-7.alios7.noarch \
python-urlgrabber-3.10-8.1.alios7.noarch
```

* 然后重新安装yum

```
rpm -ivh \
http://mirrors.163.com/centos/7.8.2003/os/x86_64/Packages/yum-3.4.3-167.el7.centos.noarch.rpm \
http://mirrors.163.com/centos/7.8.2003/os/x86_64/Packages/python-urlgrabber-3.10-10.el7.noarch.rpm \
http://mirrors.163.com/centos/7.8.2003/os/x86_64/Packages/yum-plugin-fastestmirror-1.1.31-53.el7.noarch.rpm \
http://mirrors.163.com/centos/7.8.2003/os/x86_64/Packages/yum-metadata-parser-1.1.4-10.el7.x86_64.rpm
```

* 恢复yum的packages目录

```
cp /var/lib/rpm.bdbbak/Packages /var/lib/rpm/Packages
```

* 修订yum配置中版本变量 `$releasever` （我不知道为何alios不能如centos一样获得这个变量，所以强制改为7）：

```bash
cd /etc/yum.repos.d
sed -i 's/\$releasever/7/g' *
```

> 但是，这里一定要注意，在完成升级之后，一定要把 `/etc/yum.conf.d` 目录下文件再恢复原样，即恢复 `$releasever` 。因为此时已经可以正常工作，并且后续升级大版本到entOS 8需要读取这个变量配置。如果不恢复标准配置，会导致大版本升级失败，因为升级CentOS大版本会检查 `/etc/yum.conf.d` 目录下配置，如果配置不是发行版无修改到配置，会导致升级拿不到正确到 `$releasever` 版本。
>
> 由于升级后，正确的新的yum配置文件会存储为类似 `CentOS-Base.repo.rpmnew` 这样的格式，所以采用如下方法覆盖:

```
cd /etc/yum.repos.d
for i in `ls *.rpmnew`;do (file=`echo $i | awk -F.rpmnew '{print $1}'`;yes | cp $file.rpmnew $file);done
```

* 清理以前残留的yum缓存

```
rm -rf /var/cache/yum
```

* 有残留文件 `/usr/lib64/rpm-plugins/systemd_inhibit.so` 会导致rpm卸载报错

```
error: Failed to resolve symbol plugin_hooks: /usr/lib64/rpm-plugins/systemd_inhibit.so: undefined symbol: plugin_hooks
```

删除该文件之后可正常工作

```
rm -f /usr/lib64/rpm-plugins/systemd_inhibit.so
```

> 不过建议直接卸载

```
rpm -e rpm-plugin-systemd-inhibit-4.14.1-14.alios7.x86_64
```

* 执行 `yum update` 有提示 `warning: Found BDB Packages database while attempting lmdb backend: using bdb backend.` ，不过完成升级后这个报错不再出现

现在可以执行升级

```bash
yum update -y
```

--------

# 后面的记录是以前的历史记录，仅参考，2020年实际操作以上文为准

--------

# 转换到CentOS 7.4(旧方法记录)

```
rpm -e --nodeps alios-release-server-7.2-9.alios7.x86_64
rpm --import http://mirrors.163.com/centos/7.4.1708/os/x86_64/RPM-GPG-KEY-CentOS-7
rpm -ivh http://mirrors.163.com/centos/7.4.1708/os/x86_64/Packages/centos-release-7-4.1708.el7.centos.x86_64.rpm
```

部分软件包版本号有冲突(AliOS采用了更高的版本编号)，需要做降级：

```
yum downgrade systemd-libs-219-42.el7_4.10 systemd-219-42.el7_4.10 systemd-sysv-219-42.el7_4.10

yum downgrade libgpg-error-1.12-3.el7 \
bzip2-libs-1.0.6-13.el7 bzip2-1.0.6-13.el7 \
libattr-2.4.46-12.el7 attr-2.4.46-12.el7 \
cracklib-2.9.0-11.el7 cracklib-dicts-2.9.0-11.el7 \
libcap-ng-0.7.5-4.el7
```

## 如何降级软件包

要找到如何降级版本，基本方法就是：当`yum upgrade`报错某些软件包冲突，就通过`rpm -qa | grep XXXX`找到有哪些相关包，例如：

```
#rpm -qa | grep systemd
systemd-219-42.4.alios7.x86_64
systemd-sysv-219-42.4.alios7.x86_64
systemd-libs-219-42.4.alios7.x86_64
```

而在`yum upgrade`时候提示：

```
Error: Package: systemd-219-42.4.alios7.x86_64 (@alios.7u2.base.x86_64)
           Requires: systemd-libs = 219-42.4.alios7
           Removing: systemd-libs-219-42.4.alios7.x86_64 (@alios.7u2.base.x86_64)
               systemd-libs = 219-42.4.alios7
           Downgraded By: systemd-libs-219-42.el7_4.10.x86_64 (updates)
               systemd-libs = 219-42.el7_4.10
......
```

就说明需要从版本`219-42.4.alios7`降级到`219-42.el7_4.10`，对应相关的软件包`systemd`和`systemd-libs`等都要同时降级，所以执行命令：

```
yum downgrade systemd-libs-219-42.el7_4.10 systemd-219-42.el7_4.10 systemd-sysv-219-42.el7_4.10
```

----

# 最新转换方法（成功，整理稿）

**alios最新版本引入了Fedora中使用的dnf包管理器**，这个dnf包管理器和CentOS官方的yum冲突，所以在转换到CentOS时需要卸载dnf。

```
rpm -e --nodeps \
libdnf-0.11.1-1.alios7.x86_64 \
python2-dnf-2.7.6-6.alios7.noarch \
dnf-conf-2.7.6-6.alios7.noarch \
python2-dnf-plugins-core-2.1.5-5.alios7.noarch \
python2-dnf-plugin-leaves-2.1.5-5.alios7.noarch \
dnf-plugins-p2p-0.1.0-1.alios7.noarch \
python2-dnf-plugin-versionlock-2.1.5-5.alios7.noarch \
dnf-2.7.6-6.alios7.noarch \
python2-dnf-plugin-show-leaves-2.1.5-5.alios7.noarch \
dnf-plugins-core-2.1.5-5.alios7.noarch \
dnf-utils-2.1.5-5.alios7.noarch

rpm -e yum-adapter-0.1.0-7.alios7.noarch alios-base-setup-7.2-33.alios7.noarch yum-langpacks-0.4.2-4.1.alios7.noarch yum-plugin-fastestmirror-1.1.31-34.1.alios7.noarch python-urlgrabber-3.10-7.1.alios7.noarch
```

> 上述软件包版本可能会有出入，以实际操作系统版本为准，都需要卸载
>
> 具体以 `rpm -qa | grep dnf` 和 `rpm -qa | grep yum` 为准，例如

```
rpm -e --nodeps \
python2-dnf-2.7.6-6.alios7.noarch \
python2-dnf-plugin-show-leaves-2.1.5-6.alios7.noarch \
dnf-utils-2.1.5-5.alios7.noarch \
python2-dnf-plugins-core-2.1.5-6.alios7.noarch \
dnf-conf-2.7.6-6.alios7.noarch \
libdnf-0.11.1-1.alios7.x86_64 \
dnf-plugins-p2p-0.1.0-1.alios7.noarch \
dnf-2.7.6-6.alios7.noarch \
dnf-plugins-core-2.1.5-6.alios7.noarch \
python2-dnf-plugin-leaves-2.1.5-6.alios7.noarch \
python2-dnf-plugin-versionlock-2.1.5-6.alios7.noarch

rpm -e --nodeps \
yum-langpacks-0.4.2-4.1.alios7.noarch \
yum4-2.7.6-6.alios7.noarch \
yum-adapter-0.1.0-7.alios7.noarch \
yum-baseline-hc-1.0.0-20190714.alios7.x86_64 \
yum-metadata-parser-1.1.4-10.1.alios7.x86_64 \
yum-plugin-listdownloadpkgurl-1.0.0-4.alios7.x86_64 \
yum-plugin-fastestmirror-1.1.31-46.alios7.noarch \
python-urlgrabber-3.10-8.1.alios7.noarch
```

然后重新安装yum

```
rpm -ivh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/yum-3.4.3-161.el7.centos.noarch.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-urlgrabber-3.10-9.el7.noarch.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/yum-plugin-fastestmirror-1.1.31-50.el7.noarch.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/yum-metadata-parser-1.1.4-10.el7.x86_64.rpm
```

需要删除 `taobao-repo-utils` 否则centos 的 yum报错

```
rpm -e taobao-repo-utils-2.1.0-5.noarch
```

此时 `yum update` 还是报错

```
Traceback (most recent call last):
  File "/bin/yum", line 29, in <module>
    yummain.user_main(sys.argv[1:], exit_code=True)
...
OSError: [Errno 2] No such file or directory: '/var/lib/rpm/Packages'
```

这个 `/var/lib/rpm/Packages` 实际上是被alios部署dnf时候备份移动到 `/var/lib/rpm.bdbbak/Packages` ，可以复制回来就可以使用yum。

```
cp /var/lib/rpm.bdbbak/Packages /var/lib/rpm/Packages
```

现在就可以使用 `yum update` 了，不过，还需要删除alios仓库信息并加入CentOS信息:

```
rpm -e --nodeps alios-release-server-7.2-18.alios7.x86_64
# 或者
rpm -e --nodeps alios-release-server-7.2-23.alios7.x86_64

rpm --import http://mirrors.163.com/centos/7.6.1810/os/x86_64/RPM-GPG-KEY-CentOS-7
rpm -ivh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/centos-release-7-6.1810.2.el7.centos.x86_64.rpm
```

* 安装EPEL

```
rpm -ivh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

此时就可以使用

```
yum clean all
```

不过会提示，有其他repo占用了磁盘，用以下命令检查

```
yum clean all --verbose
```

可以看到

```
32 M   untracked repos:
  30 M   /var/cache/yum/x86_64/7/alios.7u2.base.x86_64
  1.5 M  /var/cache/yum/x86_64/7/ops.7.x86_64
  636 k  /var/cache/yum/x86_64/7/ops.7.noarch
37     other data:
  37     /var/cache/yum/x86_64/7/timedhosts
```

删除这些目录

```
rm -rf /var/cache/yum/x86_64/7/alios.7u2.base.x86_64 \
/var/cache/yum/x86_64/7/ops.7.x86_64 \
/var/cache/yum/x86_64/7/ops.7.noarch \
/var/cache/yum/x86_64/7/timedhosts
```

* 安装screen，并以screen启动后再进行系统升级，避免网络断开

* 开始系统升级

```
yum update
```

> 由于当前CentOS 7.6大多数软件包版本都比alios新，所以几乎所有软件都会替换成标准的社区版本。

* 有残留文件 `/usr/lib64/rpm-plugins/systemd_inhibit.so` 会导致rpm卸载报错

```
error: Failed to resolve symbol plugin_hooks: /usr/lib64/rpm-plugins/systemd_inhibit.so: undefined symbol: plugin_hooks
```

删除该文件之后可正常工作

```
rm -f /usr/lib64/rpm-plugins/systemd_inhibit.so
```

* 其他可能会有一些软件包需要降级，以便能够适配CentOS发行版提供的软件包，例如，安装kvm环境，会提示由于系统已经安装了高版本的rpm包，导致CentOS无法提供对应高版本依赖包，则需要降级系统已经安装的rpm包后才能使用CentOS软件包安装:

```
yum downgrade keyutils-libs-1.5.8-3.el7.x86_64 libverto-0.2.5-4.el7.x86_64
```

----

# 最新转换方法的各种探索折腾（仅做记录，整理见上文）

> 注意，alios引入了fedora中使用的dnf包管理工具，我尝试卸载dnf和恢复yum标准环境，但是发现导致了yum环境混乱无法正常工作。所以还是恢复DNF工作，采用 [dnf管理软件包](manage_package_with_dnf) 来完成系统软件安装维护。(失败，最终未解决)
>
> 这里的技巧是：移除所有非社区repo配置，但是保留 CentOS官方repo 和 EPEL官方repo，然后立即升级 dnf ，这样可以使用EPEL官方repo提供的DNF覆盖alios的DNF，后续就可以切换到社区软件仓库继续滚动升级。

```
rpm -ivh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

* 升级DNF:

```
yum update dnf
```

出现报错

```
Error:
 Problem: package dnf-4.0.9.2-1.el7_6.noarch conflicts with python2-dnf-plugins-core < 4.0.2 provided by python2-dnf-plugins-core-2.1.5-6.alios7.noarch
  - package python2-dnf-plugin-leaves-2.1.5-6.alios7.noarch requires python2-dnf-plugins-core = 2.1.5-6.alios7, but none of the providers can be installed
  - cannot install the best update candidate for package dnf-2.7.6-6.alios7.noarch
  - problem with installed package python2-dnf-plugin-leaves-2.1.5-6.alios7.noarch
(try to add '--allowerasing' to command line to replace conflicting packages or '--skip-broken' to skip uninstallable packages)
```

改为执行:

```
yum upgrade dnf --allowerasing
```

此时提示

```
======================================================================================================================
 Package                                   Arch              Version                         Repository          Size
======================================================================================================================
Upgrading:
 dnf                                       noarch            4.0.9.2-1.el7_6                 extras             357 k
 dnf-plugins-core                          noarch            4.0.2.2-3.el7_6                 extras              51 k
 libdnf                                    x86_64            0.22.5-1.el7_6                  extras             533 k
 libsolv                                   x86_64            0.6.34-2.el7                    base               328 k
 python-urlgrabber                         noarch            3.10-9.el7                      base               108 k
 python2-dnf                               noarch            4.0.9.2-1.el7_6                 extras             414 k
 python2-dnf-plugin-versionlock            noarch            4.0.2.2-3.el7_6                 extras              44 k
 python2-dnf-plugins-core                  noarch            4.0.2.2-3.el7_6                 extras             165 k
 python2-hawkey                            x86_64            0.22.5-1.el7_6                  extras              68 k
Installing dependencies:
 dnf-data                                  noarch            4.0.9.2-1.el7_6                 extras              51 k
     replacing  dnf-conf.noarch 2.7.6-6.alios7
 libmodulemd                               x86_64            1.6.3-1.el7                     extras             141 k
 libsmartcols                              x86_64            2.23.2-59.el7_6.1               updates            140 k
 libyaml                                   x86_64            0.1.4-11.el7_0                  base                55 k
 python-dateutil                           noarch            1.5-7.el7                       base                85 k
 python-enum34                             noarch            1.0.4-1.el7                     base                52 k
 python2-libdnf                            x86_64            0.22.5-1.el7_6                  extras             608 k
 yum                                       noarch            3.4.3-161.el7.centos            base               1.2 M
Removing dependent packages:
 dnf-utils                                 noarch            2.1.5-5.alios7                  @System            4.0 k
 python2-dnf-plugin-leaves                 noarch            2.1.5-6.alios7                  @System            9.5 k
 python2-dnf-plugin-show-leaves            noarch            2.1.5-6.alios7                  @System            4.7 k
 yum-adapter                               noarch            0.1.0-7.alios7                  @System            653
 yum4                                      noarch            2.7.6-6.alios7                  @System              0

Transaction Summary
======================================================================================================================
Install  8 Packages
Upgrade  9 Packages
Remove   5 Packages
```

注意，完成后还有一些残留alios的dnf软件包会影响工作，则检查系统看有哪些残留的 dnf form alios 软件包，逐个清理:

```
#rpm -qa | grep dnf | grep alios
dnf-plugins-p2p-0.1.0-1.alios7.noarch
```

执行清理命令

```
rpm -e dnf-plugins-p2p-0.1.0-1.alios7.noarch
```

----

```
dnf clean all
```

会报错

```
Traceback (most recent call last):
  File "/bin/dnf", line 57, in <module>
    from dnf.cli import main
  File "/usr/lib/python2.7/site-packages/dnf/__init__.py", line 30, in <module>
    import dnf.base
  File "/usr/lib/python2.7/site-packages/dnf/base.py", line 29, in <module>
    import libdnf.transaction
  File "/usr/lib64/python2.7/site-packages/libdnf/__init__.py", line 3, in <module>
    from . import conf
  File "/usr/lib64/python2.7/site-packages/libdnf/conf.py", line 17, in <module>
    _conf = swig_import_helper()
  File "/usr/lib64/python2.7/site-packages/libdnf/conf.py", line 16, in swig_import_helper
    return importlib.import_module('_conf')
  File "/usr/lib64/python2.7/importlib/__init__.py", line 37, in import_module
    __import__(name)
ImportError: No module named _conf
```

检查上述python文件涉及的rpm包

```
#rpm -qf /bin/dnf
dnf-4.0.9.2-1.el7_6.noarch

#rpm -qf /usr/lib/python2.7/site-packages/dnf/__init__.py
python2-dnf-4.0.9.2-1.el7_6.noarch

#rpm -qf /usr/lib/python2.7/site-packages/dnf/base.py
python2-dnf-4.0.9.2-1.el7_6.noarch

#rpm -qf /usr/lib64/python2.7/site-packages/libdnf/__init__.py
python2-libdnf-0.22.5-1.el7_6.x86_64

#rpm -qf /usr/lib64/python2.7/site-packages/libdnf/conf.py
python2-libdnf-0.22.5-1.el7_6.x86_64

#rpm -qf /usr/lib64/python2.7/importlib/__init__.py
python-libs-2.7.5-34.1.alios7.x86_64
```

其中 `python-libs` 是alios版本，在CentOS中找到对应版本进行升级

```
rpm -Uvh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-libs-2.7.5-76.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-2.7.5-76.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/openssl-1.0.2k-16.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/openssl-libs-1.0.2k-16.el7.x86_64.rpm
```

但是还是没有解决上述报错，检查 `/usr/lib64/python2.7/site-packages/libdnf/conf.py` :

```python
# This file was automatically generated by SWIG (http://www.swig.org).
# Version 3.0.12
#
# Do not make changes to this file unless you know what you are doing--modify
# the SWIG interface file instead.

from sys import version_info as _swig_python_version_info
if _swig_python_version_info >= (2, 7, 0):
    def swig_import_helper():
        import importlib
        pkg = __name__.rpartition('.')[0]
        mname = '.'.join((pkg, '_conf')).lstrip('.')
        try:
            return importlib.import_module(mname)
        except ImportError:
            return importlib.import_module('_conf')
    _conf = swig_import_helper()
    del swig_import_helper
...
```

系统已经安装了swig，我尝试升级到刚放版本



尝试 `yum install python3` 提示有

```
  File "/usr/lib/yum-plugins/branch.py", line 124, in getRhelRelease
    if r[6] == '4':
```

所以卸载

```
rpm -e taobao-repo-utils-2.1.0-5.noarch
```

尝试安装python3

```
rpm -ivh https://mirrors.tuna.tsinghua.edu.cn/epel/7/x86_64/Packages/p/python36-3.6.8-1.el7.x86_64.rpm https://mirrors.tuna.tsinghua.edu.cn/epel/7/x86_64/Packages/p/python36-libs-3.6.8-1.el7.x86_64.rpm
```

错误依旧

将所有alios的python2相关包搜索出来重新升级

```
#rpm -qa | grep python2 | grep alios
python2-rpm-4.14.1-13.alios7.x86_64
python2-libcomps-0.1.8-3.alios7.x86_64
python27-pycrypto-2.6.1-1.alios7.x86_64
python2-librepo-1.8.2-2.alios7.x86_64
python2-ipaddress-1.0.18-5.alios7.noarch
```

尝试删除 `python2-rpm-4.14.1-13.alios7.x86_64`

```
#rpm -e python2-rpm-4.14.1-13.alios7.x86_64
error: Failed dependencies:
	rpm-python >= 4.11.3-25.el7.centos.1 is needed by (installed) python2-dnf-4.0.9.2-1.el7_6.noarch
	rpm-python is needed by (installed) yum-3.4.3-161.el7.centos.noarch
```

但是系统并没有安装 rpm-python 而是安装了 python2-rpm-4.14.1-13.alios7.x86_64 ，似乎是这个冲突？

已经安装的 python2-rpm-4.14.1-13.alios7.x86_64 版本高于官方 rpm-python-4.11.3-35.el7.x86_64


* 手工安装swig?（不行）

```
rpm -ivh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-devel-2.7.5-76.el7.x86_64.rpm
```

然后从  https://sourceforge.net/projects/swig/files/swig/swig-2.0.12/ 下载

```
rpm -Uvh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/pcre-devel-8.32-17.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/pcre-8.32-17.el7.x86_64.rpm
```

```
tar xfz swig-2.0.12.tar.gz
cd swig-2.0.12
./configure

make
make install
```

但是没有解决

突然看到 https://forums.fedoraforum.org/showthread.php?314779-DNF-Python-failure-after-upgrade-to-F26 :

I solved the problem by pointing the dnf script to python3.5 (which did have the dnf module installed).

First edit /usr/bin/dnf.

I changed the shebang statement to:

Code:

#! /usr/bin/python3.5

then, I re-ran:

Code:

sudo dnf system-upgrade reboot

根据 https://people.redhat.com/mskinner/rhug/q3.2018/MSP-RHUG-YUM-is-dead-Long-live-YUM.pdf 说明：

在 7.6 beta中，yum/yum4/dnf 是指向 dnf-2 的，我查看了系统

```
#ls -lh /usr/bin/dnf
lrwxrwxrwx 1 root root 5 Feb 14 04:19 /usr/bin/dnf -> dnf-2

#ls -lh /usr/bin/yum
-rwxr-xr-x 1 root root 801 Nov  5  2018 /usr/bin/yum
```

但是从fedora 28开始，应该同时指向 dnf-3

目前已经安装的python2版本dnf相关包

```
python2-libdnf-0.22.5-1.el7_6.x86_64
python2-dnf-4.0.9.2-1.el7_6.noarch
python2-dnf-plugins-core-4.0.2.2-3.el7_6.noarch
python2-dnf-plugin-versionlock-4.0.2.2-3.el7_6.noarch
```

可以尝试升级到python3

# 和dnf的冲突（这里执行可能错误,需要修正）

最新的alios引入了fedora中使用的dnf包管理工具，实际上这个工具尚未引入centos 7，需要移除避免冲突。

```
rpm -e --nodeps \
libdnf-0.11.1-1.alios7.x86_64 \
python2-dnf-2.7.6-6.alios7.noarch \
dnf-conf-2.7.6-6.alios7.noarch \
python2-dnf-plugins-core-2.1.5-5.alios7.noarch \
python2-dnf-plugin-leaves-2.1.5-5.alios7.noarch \
dnf-plugins-p2p-0.1.0-1.alios7.noarch \
python2-dnf-plugin-versionlock-2.1.5-5.alios7.noarch \
dnf-2.7.6-6.alios7.noarch \
python2-dnf-plugin-show-leaves-2.1.5-5.alios7.noarch \
dnf-plugins-core-2.1.5-5.alios7.noarch \
dnf-utils-2.1.5-5.alios7.noarch

rpm -e yum-adapter-0.1.0-7.alios7.noarch alios-base-setup-7.2-33.alios7.noarch yum-langpacks-0.4.2-4.1.alios7.noarch yum-plugin-fastestmirror-1.1.31-34.1.alios7.noarch python-urlgrabber-3.10-7.1.alios7.noarch
```

然后重新安装yum

```
rpm -ivh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/yum-3.4.3-161.el7.centos.noarch.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-urlgrabber-3.10-9.el7.noarch.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/yum-plugin-fastestmirror-1.1.31-50.el7.noarch.rpm
```

此时就可以使用

```
yum clean all
```

不过会提示，有其他repo占用了磁盘，用以下命令检查

```
yum clean all --verbose
```

可以看到

```
32 M   untracked repos:
  30 M   /var/cache/yum/x86_64/7/alios.7u2.base.x86_64
  1.5 M  /var/cache/yum/x86_64/7/ops.7.x86_64
  636 k  /var/cache/yum/x86_64/7/ops.7.noarch
37     other data:
  37     /var/cache/yum/x86_64/7/timedhosts
```

删除这些目录

```
rm -rf /var/cache/yum/x86_64/7/alios.7u2.base.x86_64 \
/var/cache/yum/x86_64/7/ops.7.x86_64 \
/var/cache/yum/x86_64/7/ops.7.noarch \
/var/cache/yum/x86_64/7/timedhosts
```

需要删除 `taobao-repo-utils` 否则centos 的 yum报错

```
rpm -e taobao-repo-utils-2.1.0-5.noarch
```

此时还是报错

```
Traceback (most recent call last):
  File "/bin/yum", line 29, in <module>
    yummain.user_main(sys.argv[1:], exit_code=True)
  File "/usr/share/yum-cli/yummain.py", line 375, in user_main
    errcode = main(args)
  File "/usr/share/yum-cli/yummain.py", line 239, in main
    (result, resultmsgs) = base.buildTransaction()
  File "/usr/lib/python2.7/site-packages/yum/__init__.py", line 1198, in buildTransaction
    (rescode, restring) = self.resolveDeps()
  File "/usr/lib/python2.7/site-packages/yum/depsolve.py", line 893, in resolveDeps
    CheckDeps, checkinstalls, checkremoves, missing = self._resolveRequires(errors)
  File "/usr/lib/python2.7/site-packages/yum/depsolve.py", line 1009, in _resolveRequires
    thisneeds = self._checkInstall(txmbr)
  File "/usr/lib/python2.7/site-packages/yum/depsolve.py", line 1087, in _checkInstall
    provs = self.tsInfo.getProvides(*req)
  File "/usr/lib/python2.7/site-packages/yum/transactioninfo.py", line 636, in getProvides
    result = self.getOldProvides(name, flag, version)
  File "/usr/lib/python2.7/site-packages/yum/transactioninfo.py", line 629, in getOldProvides
    for pkg, hits in self.rpmdb.getProvides(name, flag, version).iteritems():
  File "/usr/lib/python2.7/site-packages/yum/rpmsack.py", line 1497, in getProvides
    pkgs = self.searchProvides(name)
  File "/usr/lib/python2.7/site-packages/yum/rpmsack.py", line 497, in searchProvides
    ret = self.searchPrco(name, 'provides')
  File "/usr/lib/python2.7/site-packages/yum/rpmsack.py", line 476, in searchPrco
    po = self._makePackageObject(hdr, idx)
  File "/usr/lib/python2.7/site-packages/yum/rpmsack.py", line 1377, in _makePackageObject
    self._cached_rpmdb_mtime = os.path.getmtime(rpmdbfname)
  File "/usr/lib64/python2.7/genericpath.py", line 54, in getmtime
    return os.stat(filename).st_mtime
OSError: [Errno 2] No such file or directory: '/var/lib/rpm/Packages'
```

> 这个错误我找到了解决方法（见下文）

另外需要移除一些冲突软件包

```
rpm -e libganglia ganglia-gmond ganglia-devel ganglia-gmond-modules-python
```

请参考 [How to Rebuild Corrupted RPM Database in CentOS](https://www.tecmint.com/rebuild-corrupted-rpm-database-in-centos/) 重建:

```
mkdir /backups/
tar -zcvf /backups/rpmdb-$(date +"%d%m%Y").tar.gz  /var/lib/rpm

rm -f /var/lib/rpm/__db*
/usr/lib/rpm/rpmdb_verify /var/lib/rpm/Packages
```

这里显示报错 

```
rpmdb_verify: /var/lib/rpm/Packages: No such file or directory
BDB5105 Verification of /var/lib/rpm/Packages failed.
```

> 我检查了在虚拟机中安装的CentOS 7，确实有一个 `/var/lib/rpm/Packages` 这个文件是一个 Berkeley DB (Hash, version 9, native byte-order)

由于这里出现报错，则足需要dump和重新加载新的数据库

```
cd /var/lib/rpm/
mv Packages Packages.back
/usr/lib/rpm/rpmdb_dump Packages.back | /usr/lib/rpm/rpmdb_load Packages
/usr/lib/rpm/rpmdb_verify Packages
```

同样报错

```
BDB5105 Verification of /var/lib/rpm/Packages failed.
```

经过多次失败，我突然想到，这个存在问题的系统，或许有一个Packages文件位于某处，只是之前软件包管理不是标准位置导致的问题。

在 `/var/lib` 目录下执行 `find . -name Packages` ，果然发现了一个 `./rpm.bdbbak/Packages` 文件，或许就是之前alios切换到DNF时候备份的系统原先使用yum管理的库文件。 另外，在 `./rpm.lmdbbak/` 有 `data.mdb  lock.mdb`

* 尝试复制回文件

```
cp /var/lib/rpm.bdbbak/Packages /var/lib/rpm/
```

然后再次执行:

```
/usr/lib/rpm/rpmdb_verify /var/lib/rpm/Packages
```

这次没有报错，显示

```
BDB5105 Verification of /var/lib/rpm/Packages succeeded.
```

再次执行

```
yum clean all
```

这次提示信息似乎正常

```
warning: Found BDB Packages database while attempting lmdb backend: using bdb backend.
warning: Generating 18 missing index(es), please wait...
Loaded plugins: fastestmirror, langpacks
Cleaning repos: base epel extras updates
Cleaning up list of fastest mirrors
Other repos take up 257 M of disk space (use --verbose for details)
```

现在解决了，可以使用yum了，只不过每次都会提示 `warning: Found BDB Packages database while attempting lmdb backend: using bdb backend.`

# dcrpm(修复工具，实际也没有解决，仅记录)

尝试采用 [dcrpm](https://github.com/facebookincubator/dcrpm) 可以检测和修复rpm，所以尝试如下:

```
git clone https://github.com/facebookincubator/dcrpm.git
cd dcrpm
python setup.py install
```

这里有报错 

```
ImportError: No module named setuptools
```

则先安装

```
rpm -ivh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-setuptools-0.9.8-7.el7.noarch.rpm
```

再次执行

```
python setup.py install
```

报错

```
psutil/_psutil_common.c:9:20: fatal error: Python.h: No such file or directory
 #include <Python.h>
                    ^
compilation terminated.
error: Setup script exited with error: command 'gcc' failed with exit status 1
```

由于系统没有安装 python-devel ，所以通过以下命令一次安装升级 python-devel

```
rpm -Uvh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-libs-2.7.5-76.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-2.7.5-76.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/python-devel-2.7.5-76.el7.x86_64.rpm
```

再次执行安装成功。

然后执行:

```
dcrpm
```

报错

```
ImportError: No module named typing
```

安装pip，通过pip安装:

```
curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"

python get-pip.py
```

再通过pip安装typing

```
pip install typing
```

然后继续执行dcrpm

但是没有输出也没有修复。

参考 [How to rebuild RPM database on a Red Hat Enterprise Linux system?](https://access.redhat.com/solutions/6903)

* 清理本地锁

```
grep rpm /etc/rc.d/rc.sysinit
rm -f /var/lib/rpm/__db* &> /dev/null
```

* 删除所有 `/var/spool/up2date` 目录下文件

```
cd /var/spool/up2date
rm *
rm .*
```

* 确保没有进程在使用rpm

```
ps -aux | grep -e rpm -e yum -e up2date
lsof | grep /var/lib/rpm
```

* 删除db文件

```
rm -f /var/lib/rpm/__db*
```

* 备份

```
cd /var/lib
tar -zcvf /var/preserve/rpmdb-$(date +%Y-%m-%d_%H-%M-%S).tar.gz rpm
```

* 验证Packages文件

```
cd /var/lib/rpm
rm -f __db*      # to avoid stale locks
/usr/lib/rpm/rpmdb_verify Packages
```

同样报错

```
rpmdb_verify: Packages: No such file or directory
BDB5105 Verification of Packages failed.
```

比较奇怪，使用 `rpm -qa` 是可以正常输出系统已经安装的RPM包

Red Hat提供了另外一个参考文档 [How to recover rpm database using /var/log/rpmpkgs?](https://access.redhat.com/solutions/23743) ，此外提供了一个 [How to rebuild RPM database on a Red Hat Enterprise Linux system? ](http://people.redhat.com/berrange/notes/rpmrecovery.html)

* 创建工作目录

```
mkdir /var/tmp/recoverdb
```

* 确保所有yum-util软件包已经安装:

```
yum install yum-utils
```

* 如果失败，则下载软件包手工安装

```
rpm -Uvh --nodeps --force yum-utils*.rpm
```

* 安装完成后，执行以下命令下载所需要的软件包

```
cat /var/log/rpmpkgs | sed 's,\.[^.]\+\.rpm$,,g' | while read nvr
    do
      yumdownloader --destdir=/var/tmp/recoverdb $nvr
    done
```

* 重建rpm数据库

```
cd /var/tmp/recoverdb
ls *.rpm > MANIFEST
rpm -Uvh --noscripts --notriggers --force --justdb MANIFEST
```

出现报错

```
error: Failed dependencies:
	libc.so.6 is needed by atk-2.28.1-1.el7.i686
    ...
	libc.so.6(GLIBC_2.0) is needed by at-spi2-atk-2.26.2-1.el7.i686
    ...
	libc.so.6(GLIBC_2.0) is needed by at-spi2-core-2.28.0-1.el7.i686
    ...
```

由于报错都是 `.i686` 并且检查下载的rpm包中有 `*.el7.i686.rpm` ，推测是系统纯 `x86_64` 系统，所以缺乏相关依赖包。

先升级glibc x86_64，然后再安装i686版本

```
rpm -Uvh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-common-2.17-260.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-2.17-260.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-devel-2.17-260.el7.x86_64.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-headers-2.17-260.el7.x86_64.rpm
```

```
rpm -ivh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-2.17-260.el7.i686.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-devel-2.17-260.el7.i686.rpm
```

此时还报告缺少

```
error: Failed dependencies:
	libfreebl3.so is needed by glibc-2.17-260.el7.i686
	libfreebl3.so(NSSRAWHASH_3.12.3) is needed by glibc-2.17-260.el7.i686
```

参考 https://zhidao.baidu.com/question/362945838409899652.html ，这个库位于 nss-softokn-freebl ，并且要和 glibc 一起安装

```
rpm -ivh http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-2.17-260.el7.i686.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/glibc-devel-2.17-260.el7.i686.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/nss-softokn-freebl-3.36.0-5.el7_5.i686.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/nss-util-3.36.0-1.el7_5.i686.rpm http://mirrors.163.com/centos/7.6.1810/os/x86_64/Packages/nspr-4.19.0-1.el7_5.i686.rpm
```

再次尝试 `yum update` 依然出现报错

```
OSError: [Errno 2] No such file or directory: '/var/lib/rpm/Packages'
```