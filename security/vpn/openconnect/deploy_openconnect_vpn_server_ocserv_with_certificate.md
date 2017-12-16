虽然简单地[部署ocserv VPN服务器](deploy_ocserv_vpn_server)能够运行一个基本的密码认证的VPN服务器，但是如果不能部署web服务以提供证书下载和导入。则对于一些安全要求严格的VPN客户端，例如，我使用的Ubuntu Touch手机内置的OpenVPN客户端，会提示`This VPN is not safe to use. It does not provide a certificate.The VPN provider could be impersonated.`

> 本文是为了进一步完善[部署ocserv VPN服务器](deploy_ocserv_vpn_server)，实现证书下载以及密钥认证（免密码）方便个人或小型企业使用。

OCserv是OpenConnect VPN服务器，采用OpenConnect SSL VPN协议，并且和Cisco AnyConnect SSL VPN协议的客户端兼容。OpenConnect协议提供了 TCP/UDP VPN通道，使用标准的IETF安全协议加密。虽然主要是在GNU/Linux平台部署，但是其设计是兼容任何Unix平台的。Ubuntu 16.04发行版提供了OCserv软件包，所以不需要源代码编译。客户端可以使用 iOS平台的Cisco AnyConnect VPN客户端。

# 安装软件

> CentOS 7可以通过EPEL软件仓库安装`ocserv`服务

```
yum install ocserv
```

> 安装`ocserv`服务时会同时安装`gnutls-utils`，提供了创建CA证书的工具。

# 创建CA证书和服务器证书

GnuTLS证书工具（`certtool`）可以在一个配置模板文件中指定证书的字段内容。

* 创建证书权威（Certificate Authority, CA）证书的配置模板：

```
cd /etc/ocserv
sudo vim ca.tmpl
```

在配置文件中添加

```
cn = "My CA"
organization = "My Org"
serial = 1
expiration_days = 3650
ca
signing_key
cert_signing_key
crl_signing_key
```

* 从这个CA证书生成一个密钥和证书：

```
sudo certtool --generate-privkey --outfile ca-key.pem

sudo certtool --generate-self-signed --load-privkey ca-key.pem \
--template ca.tmpl --outfile ca-cert.pem
```

* 然后创建一个服务器证书模板文件：

```
sudo vim server.tmpl
```

服务器证书摹本文件内容如下:

```
cn = "vpn.xuri.me"
organization = "My Org"
expiration_days = 3650
signing_key
encryption_key
tls_www_server
```

> 注意：这里 `cn = "vpn.xuri.me"` 需要体换成实际的服务器名字

* 创建服务器密钥和证书：

```
sudo certtool --generate-privkey --outfile server-key.pem

sudo certtool --generate-certificate --load-privkey server-key.pem \
--load-ca-certificate ca-cert.pem --load-ca-privkey ca-key.pem \
--template server.tmpl --outfile server-cert.pem
```

# 使用商业证书（可选）

> 参考[How to Set up OpenConnect VPN Server (ocserv) on Ubuntu 16.04/17.10 with Let’s Encrypt](https://www.linuxbabe.com/ubuntu/openconnect-vpn-server-ocserv-ubuntu-16-04-17-10-lets-encrypt)

可以使用 Let’s Encrypt 客户端 (Certbot) 来获取免费的服务器证书

# 配置OpenConnect VPN server

* 编辑`ocserv.conf`

```
#auth = "pam[gid-min=1000]"
auth = "plain[/etc/ocserv/ocpasswd]"

#server-cert = /etc/ssl/certs/ssl-cert-snakeoil.pem
#server-key = /etc/ssl/private/ssl-cert-snakeoil.key
server-cert = /etc/ocserv/server-cert.pem
server-key = /etc/ocserv/server-key.pem

#try-mtu-discovery = false
try-mtu-discovery = true

ipv4-network = 192.168.1.0/24

#dns = 192.168.1.2
dns = 8.8.8.8

# Comment out all route fields
#route = 10.10.10.0/255.255.255.0
#route = 192.168.0.0/255.255.0.0
#route = fef4:db8:1000:1001::/64

#no-route = 192.168.5.0/255.255.255.0

cisco-client-compat = true
```

# 创建用户id和密码

这里创建一个用户名`xuri`

```
sudo ocpasswd -c /etc/ocserv/ocpasswd xuri
```

# 设置包转发

* 编辑`/etc/sysctl.conf`配置如下

```
net.ipv4.ip_forward=1
```

* 使内核配置生效：

```
sudo sysctl -p
```

# 设置防火墙

* 允许防火墙访问SSL

```
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 443 -j ACCEPT
```

* 激活NAT地址转换

```
iptables -t nat -A POSTROUTING -j MASQUERADE
```

* 启动OpenConnect VPN 服务

```
sudo systemctl start ocserv
```

* 检查端口是否打开

```
sudo netstat -tulpn | grep 443
```

# 设置CA证书能够被下载

为了能够在客户端验证服务器证书，需要部署一个http服务提供CA证书下载以便能够安装到客户端作为信任的根证书。

* 设置防火墙允许浏览器访问http服务

```
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
```

* 安装Apache或者Nginx

* 将证书复制到web的根下载目录

```
sudo cp /etc/ocserv/ca-cert.pem /var/www/html
```

# 参考

* [OCserv on Ubuntu 16.04 for Cisco AnyConnect Client](https://xuri.me/2016/03/19/ocserv-on-ubuntu-16-04-for-cisco-anyconnect-client.html)
* [How to Set up OpenConnect VPN Server (ocserv) on Ubuntu 16.04/17.10 with Let’s Encrypt](https://www.linuxbabe.com/ubuntu/openconnect-vpn-server-ocserv-ubuntu-16-04-17-10-lets-encrypt)
