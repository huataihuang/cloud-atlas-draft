# 安装Twisted

* 安装virtualenv

```
virtualenv venv3
. venv3/bin/active
```

* 安装twisted

```
pip install twisted
```

# 使用

```
twistd -n ftp
```

以及选项

```
twistd ftp --help

Usage: twistd [options] ftp [options].
WARNING: This FTP server is probably INSECURE do not use it.
Options:
  -p, --port=           set the port number [default: 2121]
  -r, --root=           define the root of the ftp-site. [default:
                    /usr/local/ftp]
  --userAnonymous=  Name of the anonymous user. [default: anonymous]
  --password-file=  username:password-style credentials database
  --version         
  --help            Display this help and exit.
```

> 另外一个推荐FTP模块 [pyftpdlib](https://github.com/giampaolo/pyftpdlib)是一个非常完善的FTP实现，集成在chromium和bazaar中，是最完善的RFC-959(FTP server)实现。

在使用ios平台的foobar2000时候，该软件提供了一个内置的ftp server来同步。但是启动时候报错 `Error initializing FTP server: network error` 。

在mac上安装独立的ftpd参考 [How to Install FTP on MacOS Mojave & High Sierra](http://osxdaily.com/2018/08/07/get-install-ftp-mac-os/) ，不过需要注意，现在高版本macOS已经移除了内建的ftpd服务。

# 参考

* [Twisted官网](https://twistedmatrix.com/trac/)
* [One line ftp server in python](https://stackoverflow.com/questions/4994638/one-line-ftp-server-in-python)