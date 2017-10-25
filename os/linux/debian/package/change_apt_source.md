Debian升级软件包默认使用的软件源因为网络问题，往往非常缓慢，需要更新成国内镜像源。

Debian的软件源配置是`/etc/apt/sources.list`，默认内容是

```
deb http://deb.debian.org/debian stretch main
deb http://deb.debian.org/debian stretch-updates main
deb http://security.debian.org stretch/updates main
```

可以替换成国内的163镜像：

```
deb http://mirrors.163.com/debian/ stretch main non-free contrib
deb http://mirrors.163.com/debian/ stretch-updates main non-free contrib
deb http://mirrors.163.com/debian/ stretch-backports main non-free contrib
deb-src http://mirrors.163.com/debian/ stretch main non-free contrib
deb-src http://mirrors.163.com/debian/ stretch-updates main non-free contrib
deb-src http://mirrors.163.com/debian/ stretch-backports main non-free contrib
deb http://mirrors.163.com/debian-security/ stretch/updates main non-free contrib
deb-src http://mirrors.163.com/debian-security/ stretch/updates main non-free contrib
```

> 替换前先备份原文件

# 参考

* [Debian镜像使用帮助](http://mirrors.163.com/.help/debian.html)