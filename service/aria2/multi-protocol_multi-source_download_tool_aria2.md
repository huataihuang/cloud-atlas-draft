# aria2支持功能

* HTTP/HTTPS GET support
* HTTP Proxy support
* HTTP BASIC authentication support
* HTTP Proxy authentication support
* FTP support(active, passive mode)
* FTP through HTTP proxy(GET command or tunneling)
* Segmented download
* Cookie support
* It can run as a daemon process.
* BitTorrent protocol support with fast extension.
* Selective download in multi-file torrent
* Metalink version 3.0 support(HTTP/FTP/BitTorrent).
* Limiting download/upload speed

# 安装

各个发行版安装`aria2`方法如下：

```bash
[For Debian, Ubuntu & Mint]
$ sudo apt-get install aria2

[For CentOS, RHEL, Fedora 21 and older Systems]
# yum install aria2

[Fedora 22 and later systems]
# dnf install aria2

[For suse & openSUSE]
# zypper install wget

[Mageia]
# urpmi aria2

[For Debian, Ubuntu & Mint]
$ sudo pacman -S aria2
```

# 下载案例

* 下载单个文件方法如同使用常用的`wget`工具

```
aria2c https://download.owncloud.org/community/owncloud-9.0.0.tar.bz2
```

* 将文件保存成不同文件名，使用`-o`参数 - 这个方法类似`curl`

```
aria2c -o owncloud.zip https://download.owncloud.org/community/owncloud-9.0.0.tar.bz2
```

* 限制下载速度

默认`aria2`回使用最大贷款，然而有时候我们在服务器上需要限制下载速率，所以使用`--max-download-limit`参数：

```
aria2c --max-download-limit=500k https://download.owncloud.org/community/owncloud-9.0.0.tar.bz2
```

* 下载多个文件 `-Z` 参数

这个功能比较实用，方便同时下载多个文件

```
aria2c -Z https://download.owncloud.org/community/owncloud-9.0.0.tar.bz2 ftp://ftp.gnu.org/gnu/wget/wget-1.17.tar.gz
```

* 恢复中断的下载`-c`参数

如果下载过程中断，可以使用`-c`参数恢复先前中断的下载（如果服务器支持断点续传的话，否则就会重新下载）：

```
aria2c -c https://download.owncloud.org/community/owncloud-9.0.0.tar.bz2
```

* 从文件读取需要下载的文件列表 `-i`参数

```
aria2c -i test-aria2.txt
```

* 对每个服务器发起多个连接同时下载（并发多线程）可以大大加速下载 - `-x2`表示2个并发下载，`-x3`表示3个并发下载，以此类推。

```
 aria2c -x2 https://download.owncloud.org/community/owncloud-9.0.0.tar.bz2
```

* 下载Torrent文件

```
aria2c https://torcache.net/torrent/C86F4E743253E0EBF3090CCFFCC9B56FA38451A3.torrent?title=[kat.cr]irudhi.suttru.2015.official.teaser.full.hd.1080p.pathi.team.sr
```

* 下载BitTorent Magnet URI

```
aria2c 'magnet:?xt=urn:btih:248D0A1CD08284299DE78D5C1ED359BB46717D8C'
```

* 西在BitTorrent Metalink

```
 aria2c https://curl.haxx.se/metalink.cgi?curl=tar.bz2
```

* 下载有密码保护的文件

```
aria2c --http-user=xxx --http-password=xxx https://download.owncloud.org/community/owncloud-9.0.0.tar.bz2

aria2c --ftp-user=xxx --ftp-password=xxx ftp://ftp.gnu.org/gnu/wget/wget-1.17.tar.gz
```

# 参考

* [aria2 (Command Line Downloader) command examples](https://www.2daygeek.com/aria2-command-line-download-utility-tool/)