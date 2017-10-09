Cisco AnyConnect是非常流行的SSL VPN客户端，并且跨平台，常见于iOS，Android，BlackBerry平台。由于我同时使用Linux，Mac，iPhone，黑莓，所以为了方便使用，采用通用的[OpenConnect VPN Server - ocserv](www.infradead.org/ocserv/)（兼容Cisco AnyConnect的开源解决方案）来部署VPN Server。

* 源代码下载

从 [ocserv gitlab软件库](https://gitlab.com/groups/ocserv) 下载最新源代码

```bash
git clone https://gitlab.com/ocserv/ocserv.git
```

* 编译依赖

Debian和Fedora编译依赖软件库分别是 `libgnutls28-dev` 和 `gnutls-devel` ，此外，对应的一些可选功能依赖库如下

```bash
TCP wrappers: libwrap0-dev       / tcp_wrappers-devel
PAM:          libpam0g-dev       / pam-devel
LZ4:          liblz4-dev         / lz4-devel
seccomp:      libseccomp-dev     / libseccomp-devel
occtl:        libreadline-dev    / readline-devel
              libnl-route-3-dev  / libnl3-devel
GSSAPI:       libkrb5-dev        / krb5-devel
```

开发依赖库如下

```bash
libprotobuf-c0-dev / protobuf-c-devel
libtalloc-dev      / libtalloc-devel
libhttp-parser-dev / http-parser-devel
libpcl1-dev        / pcllib-devel
libopts25-dev      / autogen-libopts-devel
autogen            / autogen
protobuf-c-compiler/ protobuf-c
gperf              / gperf
```

Debian/Ubuntu按照以下命令准备依赖库安装 （参考 [Setup OpenConnect VPN Server for Cisco AnyConnect on Ubuntu 14.04 x64](https://www.vultr.com/docs/setup-openconnect-vpn-server-for-cisco-anyconnect-on-ubuntu-14-04-x64)）

```bash
apt-get install build-essential pkg-config libgnutls28-dev libwrap0-dev libpam0g-dev libseccomp-dev libreadline-dev libnl-route-3-dev
```

> 上述依赖包安装缺少 `lbopts25-dev` ，编译时候发现报错，所以补充安装了官方文档中说明的所有可选依赖开发库

* 编译 ocserv

如果是发行版本

```bash
./configure && make
```

如果是git版本

```bash
autoreconf -fvi
./configure && make
```

报错

```bash
make[3]: Entering directory '/root/ocserv/libopts'
  CC       libopts_a-libopts.o
In file included from libopts.c:24:0:
enum.c: In function ‘enum_err’:
enum.c:112:13: warning: embedded ‘\0’ in format [-Wformat-contains-nul]
             fprintf(option_usage_fp, ENUM_ERR_LINE, *(paz_names++));
             ^
enum.c:135:9: warning: embedded ‘\0’ in format [-Wformat-contains-nul]
         sprintf(zFmt, ENUM_ERR_WIDTH, (int)max_len);
         ^
```

尝试改成

```bash
./configure --enable-local-libopts
```

报错改成

```bash
make[2]: Entering directory '/root/ocserv/src'
: ocpasswd-args.def
: ocserv-args.def
protoc-c --c_out=. --proto_path=. ipc.proto
/bin/bash: protoc-c: command not found
Makefile:1779: recipe for target 'ipc.pb-c.c' failed
```

解决方法参考 [OpenConnect on Ubuntu](https://sskaje.me/2014/02/openconnect-ubuntu/) 并按照官方文档安装所有可选依赖开发库DTLS Dead Peer Detection detected dead peer!

```bash
apt-get install libprotobuf-c0-dev libtalloc-dev libhttp-parser-dev libpcl1-dev libopts25-dev autogen protobuf-c-compiler gperf
```

然后重新编译就可以通过

```bash
./configure
make
```

安装

```bash
make install
```

# 配置ocserv

首先需要创建自己的CA证书和服务器证书

```bash
cd ~
apt-get install gnutls-bin
mkdir certificates
cd certificates
```

创建CA模版文件 `ca.tmpl` ，这里`cn`请设置成自己组织的cn

```bash
cn = "VPN CA" 
organization = "Big Corp" 
serial = 1 
expiration_days = 3650
ca 
signing_key 
cert_signing_key 
crl_signing_key
```

生成CA密钥和CA证书

```bash
certtool --generate-privkey --outfile ca-key.pem
certtool --generate-self-signed --load-privkey ca-key.pem --template ca.tmpl --outfile ca-cert.pem
```

然后使用以下内容创建本地服务器证书模版文件（`server.tmpl`），注意`cn`字段，必须符合你服务器的DNS名字或者IP地址

```bash
cn = "you domain name or ip"
organization = "MyCompany" 
expiration_days = 3650 
signing_key 
encryption_key
tls_www_server
```

然后创建服务器密钥和证书

```bash
certtool --generate-privkey --outfile server-key.pem
certtool --generate-certificate --load-privkey server-key.pem --load-ca-certificate ca-cert.pem --load-ca-privkey ca-key.pem --template server.tmpl --outfile server-cert.pem
```

复制密钥、证书和配置文件到ocserv配置目录

```bash
mkdir /etc/ocserv
cp server-cert.pem server-key.pem /etc/ocserv
cd ~/ocserv/doc
cp sample.config /etc/ocserv/config
cd /etc/ocserv
```

编辑 `/etc/ocserv/config` 配置文件，类似如下

```bash
auth = "plain[/etc/ocserv/ocpasswd]"

try-mtu-discovery = true

server-cert = /etc/ocserv/server-cert.pem
server-key = /etc/ocserv/server-key.pem

tcp-port = 9000
udp-port = 9001
dns = 8.8.8.8

# comment out all route fields
#route = 10.10.10.0/255.255.255.0
#route = 192.168.0.0/255.255.0.0
#route = fef4:db8:1000:1001::/64
#no-route = 192.168.5.0/255.255.255.0
cisco-client-compat = true
```

> `no-route`配置可能需要根据自己的局域网配置调整。此外，对于国内网段，设置no-route可以避免国内流量通过vpn降低访问效率。

> 默认端口是`443`，这里改成`9000`

另外，参考 [安装配置AnyConnect服务端软件-ocserv](http://www.lichanglin.cn/%E5%AE%89%E8%A3%85%E9%85%8D%E7%BD%AEAnyConnect%E6%9C%8D%E5%8A%A1%E7%AB%AF%E8%BD%AF%E4%BB%B6-ocserv/)做一些配置优化调整

```bash
#同一个用户最多同时登陆数
max-same-clients = 10
# Dead peer detection in seconds.
dpd = 900
# Dead peer detection for mobile clients. The needs to
# be much higher to prevent such clients being awaken too
# often by the DPD messages, and save battery.
# (clients that send the X-AnyConnect-Identifier-DeviceType)
mobile-dpd = 1800

output-buffer = 23000 
try-mtu-discovery = true 

# The time (in seconds) that a client is allowed to stay idle (no traffic)
# before being disconnected. Unset to disable.
idle-timeout = 3600

# The time (in seconds) that a mobile client is allowed to stay idle (no
# traffic) before being disconnected. Unset to disable.
mobile-idle-timeout = 3600
```

创建用户登录帐号

```bash
ocpasswd -c /etc/ocserv/ocpasswd username
```

激活NAT

```bash
iptables -t nat -A POSTROUTING -j MASQUERADE
```

激活IPv4 forwarding，编辑`/etc/sysctl.conf`

```bash
net.ipv4.ip_forward=1
```

并使之生效

```bash
sysctl -p /etc/sysctl.conf
```

启动ocserv

```bash
ocserv -c /etc/ocserv/config
```

> 注意：Cisco AnyConnect客户端配置要同时写上服务器IP地址和端口，类似 `IP:PORT`

Debug方法

```bash
ocserv -c /etc/ocserv/config -d 9 -f
```

> `-d` 参数设置debug级别，从`0-999`

# 路由设置

参考 [Oc­serv 在 De­bian 下的安装与配置指南](https://darknode.in/network/setup-debian-ocserv/)，在 `/etc/ocserv/config` 中添加配置

```bash
no-route = 0.0.0.0/255.0.0.0
no-route = 1.0.0.0/255.128.0.0
no-route = 1.160.0.0/255.224.0.0
no-route = 1.192.0.0/255.224.0.0
no-route = 10.0.0.0/255.0.0.0
no-route = 14.0.0.0/255.224.0.0
no-route = 14.96.0.0/255.224.0.0
no-route = 14.128.0.0/255.224.0.0
no-route = 14.192.0.0/255.224.0.0
no-route = 27.0.0.0/255.192.0.0
no-route = 27.96.0.0/255.224.0.0
no-route = 27.128.0.0/255.128.0.0
no-route = 36.0.0.0/255.192.0.0
no-route = 36.96.0.0/255.224.0.0
no-route = 36.128.0.0/255.128.0.0
no-route = 39.0.0.0/255.224.0.0
no-route = 39.64.0.0/255.192.0.0
no-route = 39.128.0.0/255.192.0.0
no-route = 42.0.0.0/255.0.0.0
no-route = 43.224.0.0/255.224.0.0
no-route = 45.64.0.0/255.192.0.0
no-route = 47.64.0.0/255.192.0.0
no-route = 49.0.0.0/255.128.0.0
no-route = 49.128.0.0/255.224.0.0
no-route = 49.192.0.0/255.192.0.0
no-route = 54.192.0.0/255.224.0.0
no-route = 58.0.0.0/255.128.0.0                                          
no-route = 58.128.0.0/255.224.0.0                                        
no-route = 58.192.0.0/255.192.0.0                                        
no-route = 59.32.0.0/255.224.0.0                                         
no-route = 59.64.0.0/255.192.0.0                                         
no-route = 59.128.0.0/255.128.0.0                                        
no-route = 60.0.0.0/255.192.0.0                                          
no-route = 60.160.0.0/255.224.0.0                                        
no-route = 60.192.0.0/255.192.0.0                                        
no-route = 61.0.0.0/255.192.0.0                                          
no-route = 61.64.0.0/255.224.0.0                                         
no-route = 61.128.0.0/255.192.0.0                                        
no-route = 61.224.0.0/255.224.0.0
no-route = 100.64.0.0/255.192.0.0
no-route = 101.0.0.0/255.128.0.0
no-route = 101.128.0.0/255.224.0.0
no-route = 101.192.0.0/255.192.0.0
no-route = 103.0.0.0/255.192.0.0
no-route = 103.224.0.0/255.224.0.0
no-route = 106.0.0.0/255.128.0.0
no-route = 106.224.0.0/255.224.0.0
no-route = 110.0.0.0/254.0.0.0
no-route = 112.0.0.0/255.128.0.0
no-route = 112.128.0.0/255.224.0.0
no-route = 112.192.0.0/255.192.0.0
no-route = 113.0.0.0/255.128.0.0
no-route = 113.128.0.0/255.224.0.0
no-route = 113.192.0.0/255.192.0.0
no-route = 114.0.0.0/255.128.0.0
no-route = 114.128.0.0/255.224.0.0
no-route = 114.192.0.0/255.192.0.0
no-route = 115.0.0.0/255.0.0.0
no-route = 116.0.0.0/255.0.0.0
no-route = 117.0.0.0/255.128.0.0
no-route = 117.128.0.0/255.192.0.0
no-route = 118.0.0.0/255.224.0.0
no-route = 118.64.0.0/255.192.0.0
no-route = 118.128.0.0/255.128.0.0
no-route = 119.0.0.0/255.128.0.0
no-route = 119.128.0.0/255.192.0.0
no-route = 119.224.0.0/255.224.0.0
no-route = 120.0.0.0/255.192.0.0
no-route = 120.64.0.0/255.224.0.0
no-route = 120.128.0.0/255.224.0.0
no-route = 120.192.0.0/255.192.0.0
no-route = 121.0.0.0/255.128.0.0
no-route = 121.192.0.0/255.192.0.0
no-route = 122.0.0.0/254.0.0.0
no-route = 124.0.0.0/255.0.0.0
no-route = 125.0.0.0/255.128.0.0
no-route = 125.160.0.0/255.224.0.0
no-route = 125.192.0.0/255.192.0.0
no-route = 127.0.0.0/255.0.0.0
no-route = 139.0.0.0/255.224.0.0
no-route = 139.128.0.0/255.128.0.0
no-route = 140.64.0.0/255.224.0.0
no-route = 140.128.0.0/255.224.0.0
no-route = 140.192.0.0/255.192.0.0
no-route = 144.0.0.0/255.192.0.0
no-route = 144.96.0.0/255.224.0.0
no-route = 144.224.0.0/255.224.0.0
no-route = 150.0.0.0/255.224.0.0
no-route = 150.96.0.0/255.224.0.0
no-route = 150.128.0.0/255.224.0.0
no-route = 150.192.0.0/255.192.0.0
no-route = 152.96.0.0/255.224.0.0
no-route = 153.0.0.0/255.192.0.0
no-route = 153.96.0.0/255.224.0.0
no-route = 157.0.0.0/255.192.0.0
no-route = 157.96.0.0/255.224.0.0
no-route = 157.128.0.0/255.224.0.0
no-route = 157.224.0.0/255.224.0.0
no-route = 159.224.0.0/255.224.0.0
no-route = 161.192.0.0/255.224.0.0
no-route = 162.96.0.0/255.224.0.0
no-route = 163.0.0.0/255.192.0.0
no-route = 163.96.0.0/255.224.0.0
no-route = 163.128.0.0/255.192.0.0
no-route = 163.192.0.0/255.224.0.0
no-route = 166.96.0.0/255.224.0.0
no-route = 167.128.0.0/255.192.0.0
no-route = 168.160.0.0/255.224.0.0
no-route = 169.254.0.0/255.255.0.0
no-route = 171.0.0.0/255.128.0.0
no-route = 171.192.0.0/255.224.0.0
no-route = 172.16.0.0/255.240.0.0
no-route = 175.0.0.0/255.128.0.0
no-route = 175.128.0.0/255.192.0.0
no-route = 180.64.0.0/255.192.0.0
no-route = 180.128.0.0/255.128.0.0
no-route = 182.0.0.0/255.0.0.0
no-route = 183.0.0.0/255.192.0.0
no-route = 183.64.0.0/255.224.0.0
no-route = 183.128.0.0/255.128.0.0
no-route = 192.0.0.0/255.255.255.0
no-route = 192.0.2.0/255.255.255.0
no-route = 192.88.99.0/255.255.255.0
no-route = 192.96.0.0/255.224.0.0
no-route = 192.160.0.0/255.248.0.0
no-route = 192.168.0.0/255.255.0.0
no-route = 192.169.0.0/255.255.0.0
no-route = 192.170.0.0/255.254.0.0
no-route = 192.172.0.0/255.252.0.0
no-route = 192.176.0.0/255.240.0.0
no-route = 198.18.0.0/255.254.0.0
no-route = 198.51.100.0/255.255.255.0
no-route = 202.0.0.0/255.128.0.0
no-route = 202.128.0.0/255.192.0.0
no-route = 202.192.0.0/255.224.0.0
no-route = 203.0.0.0/255.128.0.0
no-route = 203.128.0.0/255.192.0.0
no-route = 203.192.0.0/255.224.0.0
no-route = 210.0.0.0/255.192.0.0
no-route = 210.64.0.0/255.224.0.0
no-route = 210.160.0.0/255.224.0.0
no-route = 210.192.0.0/255.224.0.0
no-route = 211.64.0.0/255.192.0.0
no-route = 211.128.0.0/255.192.0.0
no-route = 218.0.0.0/255.128.0.0
no-route = 218.160.0.0/255.224.0.0
no-route = 218.192.0.0/255.192.0.0
no-route = 219.64.0.0/255.224.0.0
no-route = 219.128.0.0/255.224.0.0
no-route = 219.192.0.0/255.192.0.0
no-route = 220.96.0.0/255.224.0.0
no-route = 220.128.0.0/255.128.0.0
no-route = 221.0.0.0/255.224.0.0
no-route = 221.96.0.0/255.224.0.0
no-route = 221.128.0.0/255.128.0.0
no-route = 222.0.0.0/255.0.0.0
no-route = 223.0.0.0/255.224.0.0
no-route = 223.64.0.0/255.192.0.0
no-route = 223.128.0.0/255.128.0.0
no-route = 224.0.0.0/224.0.0.0
```

> 不过，参考 [OpenConnect server(ocserv) 一键脚本 for deibian 7](http://www.fanyueciyuan.info/fq/ocserv-debian.html/comment-page-2) ，如果使用 openconnect 客户端，则所有版本都不支持 no-route ，可能需要使用cisco anyconnect客户端支持。所有如果使用 openconnect ，还是在客户端自己用脚本添加路由。

> 上述配置中，我更改了 192.168.0.0 ，因为我配置的ocserv使用了 192.168.101.0/255.255.255.0 作为 tun 网段，而我的局域网使用的是  192.168.1.0/24

```bash
192.168.0.0/255.255.255.0 ==> 192.168.1.0/255.255.255.0
```

> 此外，添加了一个VPN服务器的IP地址

**Cisco AnyConnect for BlackBerry 不支持 no-route 指令，如果服务器端配置了no-route，会导致无法通讯（显示主机无法解析或者网络未连接），所以最后还是全部删除了no-route配置。不过Cisco AnyConnect for iOS没有问题，但不确定no-route是否真正生效。** 反正手机主要是用于访问twiter，较少内网访问，所以暂时没有问题。Linux客户端采用罗有添加脚本。

> 有些IP段可能不是中国的，例如发现 m.voachinese.com 使用的akamai的CDN地址是日本的

```bash
m.voachinese.com.       1185    IN      CNAME   m.voanews.com.edgesuite.net.
m.voanews.com.edgesuite.net. 19185 IN   CNAME   a1250.b.akamai.net.
a1250.b.akamai.net.     30      IN      A       124.40.42.57
a1250.b.akamai.net.     30      IN      A       124.40.42.62
```

# 客户端添加路由脚本

默认的尚未连接VPN时候的路由表

```bash
Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
default         10.33.33.250    0.0.0.0         UG        0 0          0 wlp3s0
10.33.32.0      0.0.0.0         255.255.254.0   U         0 0          0 wlp3s0
loopback        0.0.0.0         255.0.0.0       U         0 0          0 lo
```

连接VPN以后的路由表

```bash
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
0.0.0.0         0.0.0.0         0.0.0.0         U         0 0          0 tun0
0.0.0.0         10.33.33.250    0.0.0.0         UG        0 0          0 wlp3s0
10.33.32.0      0.0.0.0         255.255.254.0   U         0 0          0 wlp3s0
104.236.154.90  10.33.33.250    255.255.255.255 UGH       0 0          0 wlp3s0
127.0.0.0       0.0.0.0         255.0.0.0       U         0 0          0 lo
192.168.101.0   0.0.0.0         255.255.255.0   U         0 0          0 tun0
```

参考上述ocserv服务器端设置 no-route ，在Linux主机上，采用脚本方式设置路由。思路是使用openconnect连接了VPN服务器之后，在本地终端执行脚本 vpn_route.sh start 设置路由（vpn_route.sh stop则去除路由）。注意，在 cn_route.cfg 中是需要路由的网段，类似格式如下

```bash
0.0.0.0/255.0.0.0
1.0.0.0/255.128.0.0
1.160.0.0/255.224.0.0
1.192.0.0/255.224.0.0
10.0.0.0/255.0.0.0
14.0.0.0/255.224.0.0
14.96.0.0/255.224.0.0
14.128.0.0/255.224.0.0
```

> 路由网段中去掉了

```bash
    0.0.0.0/255.0.0.0
    127.0.0.0/255.0.0.0
```

脚本 vpn_route.sh

```bash
#!/bin/bash

DEVICE=$(ip route list | grep "^default" | grep "metric 303" | awk '{print $5}')
GATEWAY=$(ip route list | grep "^default" | grep "metric 303" | awk '{print $3}')

ROUTELIST=cn_route.cfg
ROUTENUM=$(wc -l < $ROUTELIST)

addroute()
{
COUNT=0
while [ $COUNT -lt $ROUTENUM ]
do 
    let COUNT++
    NET=`head -n $COUNT $ROUTELIST | tail -1`

    ip route add $NET via $GATEWAY dev $DEVICE
done
}

delroute()
{
COUNT=0
while [ $COUNT -lt $ROUTENUM ]
do 
    let COUNT++
    NET=`head -n $COUNT $ROUTELIST | tail -1`

    ip route del $NET via $GATEWAY dev $DEVICE
done
}

case "$1" in
        start)
                addroute && exit 0
                ;;
        stop)
                delroute && exit 0
                ;;
        *)
                echo $"Usage: $0 {start|stop)"
                RETVAL=2
esac
```

# DNSMASQ

我设置了VPN服务器上的dnsmasq，想vpn连接以后，通过查询dns来解决内网和外网的dns解析（一些内网ip解析通过dnsmasq添加），但是发现，始终不能正常访问dns。在vpn服务器上是可以解析的，但是远程不行。我使用nc检查，端口是打开的

```bash
# nc -u -v -w 2 VPN_SERVER_IP 53
li421-128.members.linode.com [VPN_SERVER_IP] 53 (domain) open
```

但是查询超时

```bash
dig @VPN_SERVER_IP www.sina.com.cn
 
; <<>> DiG 9.10.2-P4 <<>> @VPN_SERVER_IP www.sina.com.cn
; (1 server found)
;; global options: +cmd
;; connection timed out; no servers could be reached
```

但是在服务器上直接查询却完全正常

```bash
root@mynode:/etc# dig @VPN_SERVER_IP www.sina.com.cn

......
;; ANSWER SECTION:
www.sina.com.cn.        1728    IN      CNAME   jupiter.sina.com.cn.
jupiter.sina.com.cn.    2767    IN      CNAME   ara.sina.com.cn.
ara.sina.com.cn.        1       IN      A       58.63.236.248
ara.sina.com.cn.        1       IN      A       121.14.1.189
ara.sina.com.cn.        1       IN      A       121.14.1.190

;; AUTHORITY SECTION:
sina.com.cn.            73563   IN      NS      ns4.sina.com.cn.
sina.com.cn.            73563   IN      NS      ns1.sina.com.cn.
sina.com.cn.            73563   IN      NS      ns3.sina.com.cn.
sina.com.cn.            73563   IN      NS      ns2.sina.com.cn.
......
```

开始我以为是vpn服务影响，所以特意关闭了VPN连接，并且从其他服务器上多次测试都没有成功。也验证了没有防火墙干扰。最后，偶然搜索到 [dnsmasq: DNS request timed out for machines in local network](http://superuser.com/questions/858443/dnsmasq-dns-request-timed-out-for-machines-in-local-network) ，原来必须显式地设置 listen-address 监听接口，DNSmasq才会对外部客户端请求响应，否则只有本机（估计DNSmasq代码中检查客户端IP来判断是否是本机IP进行过滤）才提供服务，虽然端口已经监听。

修改VPN服务器上 /etc/dnsmasq.conf 配置，添加

```bash
listen-address=192.168.101.1
listen-address=VPN_SERVER_IP
```

然后重启dnsmasq就可以正常解析。

> 为了安全起见，实际我是只监听tun接口提供服务，这样只有VPN客户端可以访问DNS。

# 参考

* [Setup OpenConnect VPN Server for Cisco AnyConnect on Ubuntu 14.04 x64](https://www.vultr.com/docs/setup-openconnect-vpn-server-for-cisco-anyconnect-on-ubuntu-14-04-x64)
* [OpenConnect SERVER Setup Guide for Beginners](http://wiki.openwrt.org/doc/howto/openconnect-setup) - 在OpenWrt上部署OpenConnect服务
* [ocserv安装文档](https://gitlab.com/ocserv/ocserv)
* 其他一些中文的设置参考文档
  * [架设OpenConnect Server给iPhone提供更顺畅的网络生活](http://bitinn.net/11084/)
  * [OpenConnect server(ocserv) 一键脚本 for deibian 7+ ](http://www.fanyueciyuan.info/fq/ocserv-debian.html/comment-page-2)
  * [编译ocserv并配置Cisco AnyConnect VPN，以便在iphone上使用OpenConnect SSL VPN翻墙](http://briteming.blogspot.com/2015/02/centos-65ocservcisco-anyconnect.html)
  * [Oc­serv 在 De­bian 下的安装与配置指南](https://darknode.in/network/setup-debian-ocserv/) - 提供了有关 no-route 的建议