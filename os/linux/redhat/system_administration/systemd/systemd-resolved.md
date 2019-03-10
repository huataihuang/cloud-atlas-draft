> 在使用Ubuntu 18.10 版本时，发现主机设置的 ``/etc/resolv.conf`` 解析器指向了IP地址是 ``127.0.0.53`` 这个本地回环地址。我很好奇为何本机并没有启动DNS服务也会如此，搜索了一下发现是 ``systemd`` 提供了一个 ``systemd-resolved`` 服务来提供本地应用DNS解析缓存，这个新技术需要学习掌握。

`systemd-resolved`是一个systemd服务，通过D-Bus接口提供本地应用程序网络域名解析，解析 [NSS](https://wiki.archlinux.org/index.php/Name_Service_Switch)服务（[nss-resolve](https://jlk.fjfi.cvut.cz/arch/manpages/man/nss-resolve.8)）和一个本地DNS监听器位于`127.0.0.53`。

`systemd-resolved` 是一个为本地应用程序提供网络域名解析的系统服务。它实现了一个缓存并且验证 `DNS/DNSSEC` 票据解析器，类似于 `LLMNR` 和多播DNS解析器和响应器。

> LLMNR[Link-Local Multicast Name Resolution](https://en.wikipedia.org/wiki/Link-Local_Multicast_Name_Resolution)是微软开发的主机名解析协议。

本地应用程序可以通过3个接口来发送域名解析：

* 原生的，完全API功能的 `systemd-resolved` 输出的API，可以参考 [API 文档](https://www.freedesktop.org/wiki/Software/systemd/resolved) 。建议使用这个API，因为 `systemd-resolved` 的API是异步并且提供所有功能（例如，可能返回 DNSSED 验证状态以及按需返回地址的接口范围来支持连接本地网络）。
* glibc的[getaddrinfo](http://man7.org/linux/man-pages/man3/getaddrinfo.3.html) API在[RFC3493](https://tools.ietf.org/html/rfc3493)定义并且提供了解析通能，包括[gethostbyname](http://man7.org/linux/man-pages/man3/gethostbyname.3.html)。这个API被广泛支持，不仅在Linux平台。当前glibc的getaddrinfo API不能提供DNSSEC验证状态信息，并且只能采用同步方式。该API的后端是由glibc Name Service Switch（[nss](http://man7.org/linux/man-pages/man5/nss.5.html)）提供。要允许glibc的NSS解析器工作能够通过`systemd-resolved`提供主机解析，需要使用glibc NSS模块[nss-resolv](https://www.freedesktop.org/software/systemd/man/nss-resolve.html#)。
* `systemd-resolved`提供了一个本地DNS监听在 `127.0.0.531` 回环地址接口。程序可以直接发送 DNS 请求，绕过任何本地API直接访问这个接口，这样可以直接连接 `systemd-resolved`。注意，虽然强烈建议使用这个方式，但是本地程序使用 glibc NSS 或者 bus API 的很多网络概念（例如 link-local addressing ，或者LLMNR Unicode domains）是不能映射成单播DNS协议。

DNS服务器通过从全局设置 `/etc/systemd/resolved.conf` 定义获取， `per-link` 状态设置在 `/etc/systemd/network/*.network` 文件（此时使用了[systemd-networkd.service](https://www.freedesktop.org/software/systemd/man/systemd-networkd.service.html#)）， per-link 动态设置通过DHCP获得，用户通过 [resolvectl](https://www.freedesktop.org/software/systemd/man/resolvectl.html#)发出请求，并且任何DNS服务器信息由其他系统服务提供。为了提升兼容性，`/etc/resolv.conf`被读取以便能够发现配置好的系统DNS服务器，但是这个方式只在没有软链接到 `/run/systemd/resolv/stub-resolv.conf`，`/usr/lib/systemd/resolv.conf`或者`/run/systemd/resolv/resolv.conf`时生效。

请注意：在Ubuntu 18.10上检查 `/etc/resolv.conf` 可以看到这个文件是软链接：

```
# ls -lh /etc/resolv.conf
lrwxrwxrwx 1 root root 39 Feb 27 21:59 /etc/resolv.conf -> ../run/systemd/resolve/stub-resolv.conf
```

内容如下：

```
nameserver 127.0.0.53
options edns0
```

# 手工设置

在本地DNS，可替代的DNS服务器通过 `resolved.conf` 文件提供(可能位置有 `/etc/systemd/resolved.conf.d/dns_servers.conf` 或者 `/etc/systemd/resolved.conf`) 内容可能默认没有设置:

```
[Resolve]
#DNS=
#FallbackDNS=
#Domains=
#LLMNR=no
#MulticastDNS=no
#DNSSEC=no
#Cache=yes
#DNSStubListener=yes
```

> `/etc/systemd/resolved.conf` 是默认系统配置，建议在 `/etc/systemd/resolved.conf.d/` 目录下增加自定义配置 `/etc/systemd/resolved.conf.d/dns_servers.conf`

可以手工设置DNS服务器在 `/etc/systemd/resolved.conf.d/dns_servers.conf` 中：

```
[Resolve]
DNS=91.239.100.100 89.233.43.71
```

# 故障切换（Fallback)

如果 `systemd-resolved` 没有从 network manager 接受到DNS服务器地址，并且没有手工配置，则可以采用 `FallbackDNS`，这提供了一个后备的解决昂安。

```
[Resolve]
FallbackDNS=127.0.0.1 ::1
```

如果不需要 fallback ，则可以在配置文件中将  `FallbackDNS`选项保持为空：

```
[Resolve]
FallbackDNS=
```

# DNSSEC

默认情况下 [DNSSEC](https://wiki.archlinux.org/index.php/DNSSEC)验证只在上游DNS服务器支持的情况下激活。如果你希望总是验证DNSSEC，并阻断不支持DNSSEC的DNS解析，则设置 `DNSSEC=TREU`，即配置 `/etc/systemd/resolved.conf.d/dnssec.conf`

```
[Resolve]
DNSSEC=true
```

测试是否支持DNSSEC验证:

不支持DNSSEC验证案例：

```
$ resolvectl query sigfail.verteiltesysteme.net

sigfail.verteiltesysteme.net: resolve call failed: DNSSEC validation failed: invalid
```

支持DNSSEC验证：

```
$ resolvectl query sigok.verteiltesysteme.net

sigok.verteiltesysteme.net: 134.91.78.139

-- Information acquired via protocol DNS in 266.3ms.
-- Data is authenticated: yes
```

# 参考

* [systemd-resolved.service](https://www.freedesktop.org/software/systemd/man/systemd-resolved.service.html)
* [systemd-resolved](https://wiki.archlinux.org/index.php/Systemd-resolved)