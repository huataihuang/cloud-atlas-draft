> 以下实践在Ubuntu 16.04.4 LTS上完成

Ubuntu在`/etc`目录下有两个文件和版本相关：

```
$ ls -lh /etc/*release
-rw-r--r-- 1 root root 105 Feb 20 16:43 /etc/lsb-release
lrwxrwxrwx 1 root root  21 Mar 13 20:02 /etc/os-release -> ../usr/lib/os-release
```

其中 `os-release`信息更为详细一些

```
NAME="Ubuntu"
VERSION="16.04.4 LTS (Xenial Xerus)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 16.04.4 LTS"
VERSION_ID="16.04"
HOME_URL="http://www.ubuntu.com/"
SUPPORT_URL="http://help.ubuntu.com/"
BUG_REPORT_URL="http://bugs.launchpad.net/ubuntu/"
VERSION_CODENAME=xenial
UBUNTU_CODENAME=xenial
```

而`lsb-release`则较为概括

```
DISTRIB_ID=Ubuntu
DISTRIB_RELEASE=16.04
DISTRIB_CODENAME=xenial
DISTRIB_DESCRIPTION="Ubuntu 16.04.4 LTS"
```

此外，`lsb_release`命令提供了检查方法：

```
$ lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 16.04.4 LTS
Release:	16.04
Codename:	xenial
```

# 参考

* [How do I check the version of Ubuntu I am running?](https://askubuntu.com/questions/686239/how-do-i-check-the-version-of-ubuntu-i-am-running/686249)