# 编译nethogs（CentOS 5上未成功）

> 源代码编译CentOS 5平台

```
make
make install
```

> 编译需要系统先安装`libpcap-devel` 和 `libpcap`

## 编译问题排查

```
cc  -Wall -Wextra -c decpcap.c
decpcap.c: In function ‘dp_parse_ethernet’:
decpcap.c:180: error: ‘ETHERTYPE_IPV6’ undeclared (first use in this function)
decpcap.c:180: error: (Each undeclared identifier is reported only once
decpcap.c:180: error: for each function it appears in.)
decpcap.c: In function ‘dp_parse_ppp’:
decpcap.c:226: error: ‘ETHERTYPE_IPV6’ undeclared (first use in this function)
decpcap.c: In function ‘dp_parse_linux_cooked’:
decpcap.c:268: error: ‘ETHERTYPE_IPV6’ undeclared (first use in this function)
make[1]: *** [decpcap.o] Error 1
make[1]: Leaving directory `/home/huatai/nethogs-0.8.5/src'
make: *** [decpcap_test] Error 2
```

参考 [Re: [Keepalived-devel] 1.2 on RHEL5.5 64bit failing to compile ](https://sourceforge.net/p/keepalived/mailman/message/26381638/) 

```
ETHERTYPE_IPV6 is defined in recent version of /usr/include/net/ethernet.h
```

但是在CentOS 5.11的`glibc-headers-2.5-123.el5_11.3`包的`/usr/include/net/ethernet.h`没有包含这个定义

# EPEL安装nethogs

```
rpm -ivh http://archives.fedoraproject.org/pub/archive/epel/epel-release-latest-5.noarch.rpm

yum install nethogs
```

> 不过在CentOS 5平台，EPEL不再更新，只提供了0.7-3版本的nethogs，版本非常陈旧。

# 参考