由于安装Kali系统非常缓慢，所以采用镜像仓库方法

> `debmirror`工具在Fedora系统中也提供，可以直接使用

```
dnf install debmirror
```

* 准备脚本（以下是一个尝试修改版本）：

```bash
#!/bin/sh

# Don't touch the user's keyring, have our own instead
export GNUPGHOME=/home/admin/kali/keyrings

# Architecture (i386, powerpc, amd64, etc.)
arch=armhf,amd64

# Section (main,contrib,non-free)
section=main,contrib,non-free

# Release of the system (squeeze,lenny,stable,testing,etc)
release=kali-rolling

# Server name, minus the protocol and the path at the end
server=http.kali.org

# Path from the main server, so http://my.web.server/$dir, Server dependant
inPath=/kali

# Protocol to use for transfer (http, ftp, hftp, rsync)
proto=http

# Directory to store the mirror in
outPath=/home/admin/kali/kali-rolling

# Start script

debmirror -a $arch \
--no-source \
--md5sums \
--progress \
--passive \
--verbose \
-s $section \
-h $server \
-d $release \
-r $inPath \
-e $proto \
$outPath
```

不过，镜像时依然出现了报错：

```
Errors:
 Download of dists/sid/Release failed: 404 Not Found
 Release gpg signature does not verify
Failed to download some Release or Release.gpg files!
releasing 1 pending lock... at /usr/share/perl5/vendor_perl/LockFile/Simple.pm line 206.
```

# 参考

* [How to create a mirror repository from kali](https://forums.kali.org/showthread.php?33422-How-to-create-a-mirror-repository-from-kali)