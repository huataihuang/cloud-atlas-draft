很多时候，针对Debian/Ubuntu系统的安装包`*.deb`有可能没有对应提供给Red Hat/CentOS操作系统的`*.rpm`软件包。不过，`alien`命令行工具提供了这两种不同发行版本体系的软件包相互转换功能。

* 转换RPM到DEB

```
alien linuxconf-devel-1.16r10-2.i386.rpm
```

* 转换DEB到RPM

```
sudo alien -r libsox1_14.2.0-1_i386.deb
```

> 转换成rpm包时候需要使用参数`-r`

* 转换成SLP，LSB，Slackware TGZ包

alien工具提供了强大的不同格式软件包转换，使用`-h`参数查看可以知道：

```
  -d, --to-deb              Generate a Debian deb package (default).
  -r, --to-rpm              Generate a Red Hat rpm package.
      --to-slp              Generate a Stampede slp package.
  -l, --to-lsb              Generate a LSB package.
  -t, --to-tgz              Generate a Slackware tgz package.
```

# 参考

* [How to Convert DEB to RPM (RPM to DEB) Package Using Alien Command](https://www.thegeekstuff.com/2010/11/alien-command-examples/)