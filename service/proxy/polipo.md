> 因特网是上天赐予的最好的礼物，是天赋人权，是生存的空气。

[Polipo](http://www.pps.univ-paris-diderot.fr/~jch/software/polipo/)是一个非常小巧快速的缓存型web代理服务器。虽然Polipo被设计成个人或者小型团队私用，但是也可以用于大型组织。

Polipo具有一下一些特点：

* 如果确定远程服务器支持的话，Polipo就会使用HTTP/1.1 `pipelining` ，这样进入的请求将管道化或者再多个连接进入并行模式（这个比简单使用持久化连接的代理服务器，如Squid，要更高效）
* 如果一个下载被中断，Polipo会缓存这个会话的`initial segement`，这样后续如果需要，可以使用`Range`请求来继续完成
* Polipo可以在客户端发送HTTP/1.0请求转发给后端服务器时升级为HTTP/1.1请求，并且自动转换
* Polipo支持IPv6
* Polipo可选使用`Poor Man's Multiplexing`来减少进一步延迟。
* 由于支持SOCKS协议，Polipo可以和`tor`匿名网络一起使用
* Polipo支持简单的过滤，可以用来移除一些广告和增加私密性。

> `pipelining` - 使用持久化连接时，有可能转换成管道化或流化请求，例如，在一个连接中发送多个请求而不用等待请求返回。这种技术使得服务器更快响应减少延迟。另外，由于多个请求在一个数据包中发送，管道化减少网络流量。管道化已经是一种常用技术，但是HTTP 1.0不支持管道化。HTTP 1.1在使用持久化连接的服务器实现要求管道化支持，但是有些存在bug的服务器虽然声称自己支持HTTP/1.1但却不支持管道化。Polipo会小心地侦测服务器是否支持管道化，如果确认服务器支持就会启用管道化。
>
> `initial segement` - 一个部分会话表示会话只有部分被缓存在本地缓存中。有三种方式会导致部分会话：客户端只请求会话的一部分（如Adobe Acrobat Reader插件），服务器端在传输中途丢弃连接（如服务器缺少资源，或者存在bug），客户端丢弃连接（例如用户点击停止）。当一个会话只有部分缓存，它仍然可以使用HTTP的称为`range`请求来请求缺失部分的数据。Polipo缓存部分会话在内存中，只存储部分会话的initial分片在磁盘缓存，然后会尝试使用`range`请求来获取缺失部分。

#  安装Polipo

从Git软件仓库扩取源代码

```bash
git clone https://github.com/jech/polipo.git
```

然后编译：

```bash
cd polipo
make
```

编译之后，当前目录下就有一个可执行文件`polipo`

如果想使用二进制执行代码，Debian系有直接发行包，RedHat软件包需要从第三方获取，Mac OS X可以使用 [DarwinPorts](http://www.macports.org/)

# 使用Polipo

> 参考 [The Polipo Manual](http://www.pps.univ-paris-diderot.fr/~jch/software/polipo/polipo.html)

polipo默认启动只监听 `127.0.0.1:8123` ，这样可以防止被非法利用。如果要对外提供服务监听所有接口：

```bash
polipo proxyAddress=0.0.0.0
```

> **注意：监听所有网络接口存在被滥用的风险，请注意在内网安全环境下使用！**

# 配置Polipo

> 在Ubuntu上安装部署polipo，配置参考`/usr/share/doc/polipo/examples/config.sample`

* 配置`/etc/polipo/config`

```ini
proxyAddress = "0.0.0.0"
allowedClients = 127.0.0.1, 192.168.0.0/24

# Uncomment this if you want to use a parent proxy:
# parentProxy = "squid.example.org:3128"

# Uncomment this if you want to use a parent SOCKS proxy:
# socksParentProxy = "localhost:9050"
# socksProxyType = socks5
```

* 启动

```
systemctl start polipo
```