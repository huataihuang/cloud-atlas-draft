# OpenConnect VPN Server

OpenConnect VPN Server，也称为 `ocserv`，采用OpenConnect SSL VPN协议，并且和Cisco AnyConnect SSL VPN协议的客户端兼容。

OpenConnect VPN Server特性：

* 轻量级并且快速
* 兼容Cisco AnyConnect客户端
* 支持密码和证书认证
* 易于设置

OpenConnect协议提供了 TCP/UDP VPN通道，使用标准的IETF安全协议加密。虽然主要是在GNU/Linux平台部署，但是其设计是兼容任何Unix平台的。Ubuntu 16.04发行版提供了OCserv软件包，所以不需要源代码编译。客户端可以使用 iOS平台的Cisco AnyConnect VPN客户端。

# 说明

本实践是在Ubuntu 18.04 LTS版本上完成。根据[Ocserv官方Debian,Ubuntu安装文档介绍](https://ocserv.gitlab.io/www/recipes-ocserv-installation-Debian-Ubuntu.html)需要注意点有：

* Ubuntu 16.04 LTS是第一个包含ocserv和radcli的Ubuntu发行版，需要激活"universe"软件仓库
* Debian8没有包含ocserv和radcli软件包
* 当前Debian/Ubuntu软件包ocserv不支持radius认证，如果需要radius认证，需要从源代码编译

# 安装

* 检查软件仓库

```
cat /etc/apt/sources.list
```

* 更新apt缓存

```
apt update
```

* 检查是否提供了ocserv

```
apt-cache show ocserv
```

* 安装ocserv

```
apt install ovserv
```

安装完成后，请OpenConncet VPN服务器是自动启动的，所以可以通过以下命令检查一下状态：

```
systemctl status ocserv
```

如果运行正常，则输出信息类似

```
● ocserv.service - OpenConnect SSL VPN server
   Loaded: loaded (/lib/systemd/system/ocserv.service; enabled; vendor preset: e
   Active: active (running) since Sun 2019-02-03 01:36:32 UTC; 1h 34min ago
     Docs: man:ocserv(8)
 Main PID: 1596 (ocserv-main)
    Tasks: 2 (limit: 505)
   CGroup: /system.slice/ocserv.service
           ├─1596 ocserv-main
           └─1605 ocserv-sm
```

# 客户端连接

在不同的Linux发行版都提供了openconnect客户端，例如，debian/ubuntu可以使用如下方法

```
sudo apt install openconnect
sudo openconnect -b vpn.mydomain.com
```

> 请参考 [安装使用OpenConnect](openconnect)


# 配置

虽然 `gnutils-bin`软件包提供了创建自己的CA和服务器证书的方式（请参考 [部署支持证书的OpenConnect VPN服务器（ocserv）](deploy_openconnect_vpn_server_ocserv_with_certificate)），但是推荐使用 Let's Encrypt certificate，不仅免费而且易于设置，最重要的一点是证书被VPN客户端信任。

## 准备

* 需要一个VPS（Virtual Private Server），推荐使用 [Vultr](https://www.vultr.com/?ref=7311541)。我自己使用的是 [Vultr 的 1 CPU 512M 500GB带宽，每月 3.5$ 规格](https://www.vultr.com/?ref=7311541) ，不过需要注意的是：
  * 很多VPS的IP地址被墙了，所以需要耐心多创建一些虚拟机，然后剔除掉不能TCP访问（ssh）的IP，然后对比各机房不同IP地址的速度和稳定性
  * 东京的IP并不如想象中这么稳定，而且很难找到没有被墙的IP，在大陆电信、移动运营商环境访问速度差异很大
  * 最好根据自己实际常用网络访问情况来判断，推荐美国西部机房，例如洛杉矶、硅谷
* 需要一个域名，建议使用国外域名注册商，因为在国内域名注册需要备案。[GoDaddy](http://www.godaddy.com/) 是全球最大域名注册商，稳定和可靠性较高，不过费用可能较高。请参考简书上的 [国外十大域名注册商都有哪些？](https://www.jianshu.com/p/aff58882bf00) 一文。

## 安装Let's Encrypt客户端（Certbot）

为了从官方PPA安装最新版本的certbot，需要先安装`software-properties-common`（你的系统也许默认已经安装）

```
sudo apt install software-properties-common
```

* 添加官方certbot PPA

```
add-apt-repository ppa:certbot/certbot
```

* 更新并安装certbot

```
apt update
apt install certbot
```

* 检查版本

```
certbot --version
```

## 从Let's Encrypt获取一个TLS证书

### Standalone plugin

如果没有WEB服务器运行在服务器上，并且你希望OpenConnect VPN服务器使用端口443，可以使用standalone plugin来获取TLS证书。

执行以下命令，注意不要忘记设置域名名的A记录：

```
sudo certbot certonly --standalone --preferred-challenges http --agree-tos --email your-email-address -d vpn.example.com
```

说明：

* `certonly` 只获取证书但是不安装
* `--standalone` 使用standalone plugin来获取证书
* `--preferred-challenges http` 执行 `http-01` challenge 来验证你的域名，也就是使用端口80。默认情况下，standalone plugin是执行`tls-sni` challenge，使用端口443。由于端游443已经被OpenConnect VPN服务器使用，所以我们更换这个默认特性。
* `--agree-tos` 同意Let's Encrypt服务条款
* `--email` 用于账号注册和恢复的邮件地址
* `-d` 指定域名

### webroot Plugin

如果服务器运行了监听爱80和443端口的WEB服务器，并且你希望将OpenConnect VPN服务器运行在其他端口，则可以使用webroot plugin来获取证书。

首先需要创建一个 `vpn.example.com` 的虚拟机主机

* Apache

编辑 `/etc/apache2/sites-available/vpn.example.com.conf` 添加如下内容

```
<VirtualHost *:80>        
        ServerName vpn.example.com

        DocumentRoot /var/www/vpn.example.com
</VirtualHost>
```

然后创建WEB根目录

```
sudo mkdir /var/www/vpn.example.com
```

设置`www-data`(Apache用户)作为web根目录的owner

```
sudo chown www-data:www-data /var/www/vpn.example.com -R
```

激活这个虚拟主机

```
sudo a2ensite vpn.example.com
```

重新加载Apache使得变更生效

```
sudo a2ensite vpn.example.com
```

一旦虚拟主机创建并激活，运行以下命令来获取Let’s Encrypt证书

```
sudo certbot certonly --webroot --agree-tos --email your-email-address -d vpn.example.com -w /var/www/vpn.example.com
```

* Nginx

编辑 `/etc/nginx/conf.d/vpn.example.com.conf`添加如下部分

```
server {
      listen 80;
      server_name vpn.example.com;

      root /var/www/vpn.example.com/;

      location ~ /.well-known/acme-challenge {
         allow all;
      }
}
```

创建WEB根目录

```
sudo mkdir /var/www/vpn.example.com
```

设置`www-data`(Nginx用户)作为web根目录的owner

```
sudo chown www-data:www-data /var/www/vpn.example.com -R
```

重启Nginx使之生效

```
sudo systemctl reload nginx
```

执行如下命令获取Let's Encrypt证书

```
sudo certbot certonly --webroot --agree-tos --email your-email-address -d vpn.example.com -w /var/www/vpn.example.com
```

## 修改OpenConnect VPN服务器配置

* 修改ocserv配置文件 `/etc/ocserv/ocserv.conf`

首先配置密码认证。默认情况下，密码认证是通过PAM(Pluggable Authentication Modules)激活，允许使用Ubuntu系统账号来登陆VPN。这个特性可以通过以下行注释掉来禁止

```
auth = "pam[gid-min=1000]"
```

如果希望用户使用独立的VPN账号而不是使用系统账号登陆，则添加以下配置使用密码文件来作为密码认证

```
auth = "plain[passwd=/etc/ocserv/ocpasswd]"
```

然后就可以使用`ocpasswd`工具命令来创建`/etc/ocserv/ocpasswd`文件。

如果不希望ocserv使用TCP和UDP端口443，就修改以下两行配置，设置指定端口。也可以保留默认配置：

```
tcp-port = 443
udp-port = 443
```

现在我们要修改服务器证书行，设置成Let's Encrypt服务器证书可key文件

将以下行修改

```
server-cert = /etc/ssl/certs/ssl-cert-snakeoil.pem
server-key = /etc/ssl/private/ssl-cert-snakeoil.key
```

修改成

```
server-cert = /etc/letsencrypt/live/vpn.example.com/fullchain.pem
server-key = /etc/letsencrypt/live/vpn.example.com/privkey.pem
```

设置客户端最大连接数量，默认是16，设置成0就是不限制

```
max-clients = 16
```

每个用户同时可以访问的设备数量，默认是2，设置0就不限制

```
max-same-clients = 2
```

修改以下行，将`false`修改成`true`以激活MTU descovery，这有助于提高VPN性能

```
try-mtu-discovery = false
```

设置默认域名为 `vpn.example.com`

```
default-domain = vpn.example.com
```

修改IPv4网段配置，注意不要和本地的IP网段重合。因为很多局域网都使用 `192.168.1.0/24` 网段，所以通常要把VPN网段修改成其他网段，例如 `10.10.10.0/24`

```
ipv4-network = 10.10.10.0
```

注意将以下行取消注释，以便能够将所有DNS查询都通过VPN（防止受到DNS污染）

```
tunnel-all-dns = true
```

修改DNS解析地址，可以使用Google的公共DNS

```
dns = 8.8.8.8
```

如果你提供VPN服务，可以在同一个服务器上运行自己的DNS解析器，此时也可以设置

```
dns = 10.10.10.1
```

使用自己的DNS可以加速查询

注释掉所有路由参数（在行首加上#，以下四行都要加上注释）

```
route = 10.10.10.0/255.255.255.0
route = 192.168.0.0/255.255.0.0
route = fef4:db8:1000:1001::/64
no-route = 192.168.5.0/255.255.255.0
```

保存并重启ocserv

```
sudo systemctl restart ocserv
```

## DTLS Handshake Failure（我实践没有遇到报错，所以没有测试）

在 Ubuntu 16.04 和 Ubuntu 18.04，ocserv服务 `ocserv.socketr` 不会考虑配置文件中 "listen-host" 值，这会导致客户端连接到VPN服务报错：

```
DTLS handshake failed: Resource temporarily unavailable, try again.
```

要修复这个问题，需要编辑 `ocserv.service` 文件。首先文件`ocserv.service`从 `/lib/systemd/systemd/`目录复制到`/etc/systemd/system/`目录，然耦再修改。这样可以避免新版本`ocserv`软件包覆盖我们到修改（有关修改systemd单元文件，参考`man systemd.unit`）

```
sudo cp /lib/systemd/system/ocserv.service /etc/systemd/system/ocserv.service
```

注释掉以下两行：

```
Requires=ocserv.socket
Also=ocserv.socket
```

保存配置文件。然后重新加载`systemd`

```
sudo systemctl daemon-reload
```

停止`ocserv.socket`并禁用它：

```
sudo systemctl stop ocserv.socket
sudo systemctl disable ocserv.socket
```

重启ocserv服务

```
sudo systemctl restart ocserv.service
```

## 创建VPN账号

```
sudo ocpasswd -c /etc/ocserv/ocpasswd username
```

这里会提示设置用户`username`的密码，信息将保存在 `/etc/ocserv/ocpasswd`

## 激活IP Forwarding （重要步骤）

为了能够让VPN服务器在VPN客户端和外部网络间路由数据播啊，需要激活IP转发。编辑 `/etc/sysctl.conf`文件，添加以下配置行到最后：

```
net.ipv4.ip_forward = 1
```

保存配置文件，然后使用`-p`参数执行`sysctl`命令以便重新加载`/etc/sysctl.conf`配置：

```
sudo sysctl -p
```

## 配置防火墙的IP Masquerading

请使用以下命令检查服务器的主网卡接口

```
ip addr
```

例如，可以检查到网卡接口名字是`ens3`，则执行

```
sudo iptables -t nat -A POSTROUTING -o ens3 -j MASQUERADE
```

这里命令`-A`表示添加到`nat`表的`POSTROUTING`链。这样就可以把VPN网络连接到Internet，并且把你的网络对外隐藏起来。这样Internet只能看到你的VPN服务器IP，但是不能看到你的VPN客户端IP，类似于你家中路由器隐藏起家庭网络。

现在可以检查一下NAT表的POSTROUTING链，可以看到目标是anywhere的源为anywhere的都执行MASQUERADE。

```
sudo iptables -t nat -L POSTROUTING
```

显示输出：

```
Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
MASQUERADE  all  --  anywhere             anywhere
```

## 在防火墙上开启端口443（采用iptables方法，可选，我使用另一种ufw方式）

```
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p udp --dport 443 -j ACCEPT
```

不过，iptables规则重启会丢失，所以需要保存：

```
su -
iptables-save > /etc/iptables.rules
```

然后创建一个systemd服务来启动时恢复iptables规则：`/etc/systemd/system/iptables-restore.service`

```
[Unit]
Description=Packet Filtering Framework
Before=network-pre.target
Wants=network-pre.target

[Service]
Type=oneshot
ExecStart=/sbin/iptables-restore /etc/iptables.rules
ExecReload=/sbin/iptables-restore /etc/iptables.rules
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

然后激活`iptables-restore`服务

```
sudo systemctl daemon-reload
sudo systemctl enable iptables-restore
```

# 安装和配置客户端

在Ubuntu桌面可以安装OpenConnect VPN客户端

```
sudo apt install openconnect
```

然后使用如下命令连接VPN，使用参数`-b`参数运行在后台`background`

```
sudo openconnect -b vpn.example.com:port-number
```

不过，上述命令是交互方式，如果要使用非交互方式可以采用以下命令：

```
echo -n password | sudo openconnect -b vpn.example.com -u username --passwd-on-stdin
```

如果使用Network Manager来管理VPN连接，需要安装以下软件包：

```
sudo apt install network-manager-openconnect network-manager-openconnect-gnome
```

## 系统启动时自动连接

为了让OpenConnect VPN客户端连接到服务器，可以创建如下系统服务单元`/etc/systemd/system/openconnect.service`：

```
[Unit]
  Description=OpenConnect VPN Client
  After=network-online.target
  Wants=network-online.target

[Service]
  Type=simple
  ExecStart=/bin/bash -c '/bin/echo -n password | /usr/sbin/openconnect vpn.example.com -u username --passwd-on-stdin'
  ExecStop=/usr/bin/pkill openconnect
  Restart=always
  RestartSec=2

[Install]
  WantedBy=multi-user.target
```

保存并激活服务

```
sudo systemctl enable openconnect.service
```

文件配置中：

* `After=network-online.target` 和 `Wants=network-online.target` 使得服务在网络启动之后运行服务
* 由于上述服务依然在network启动前运行，所以添加了`Restart=always`和`RestartSec=2`在服务启动失败之后2秒再次启动
* Systemd不能识别pipe管道重定向，所以在`ExecStart`中包装了命令并运行在bash shell中
* 由于OpenConnect VPN客户端运行在systemd服务，运行在后台，所以不需要添加`-b`参数。

也可以下载 [OpenConnect GUI客户端](https://github.com/openconnect/openconnect-gui/releases) 

# 自动更新Let's Encrypt Certificate

使用root账号添加

```
sudo crontab -e
```

添加最后行：

```
@daily certbot renew --quiet && systemctl restart ocserv
```

# 优化

OpenConnect默认使用TLS over UDP协议（DTLS）来实现更快的速度，但是UDP并不能提供可靠重传。TCP比UDP慢，但是提供了稳定可靠传输。一种优化方式是禁止DTLS，使用标准的TLS（over TCP），然后激活TCP BBR来加速TCP速度。

为了禁止DTLS，注释掉ocserv配置文件的以下行：

```
udp-port = 443
```

然后保存并重启`ocserv`服务

```
sudo systemctl restart ocserv.service
```

然后激活TCP BBR，请参考 [在Ubuntu 18上启用TCP BBR加速网络性能](../../..os/linux/kernel/net/boost_ubuntu_18_network_performance_with_tcp_bbr)

# 问题排查

# 配置OpenConnect VPN服务器和WEB服务器同时使用端口443

> 待实践

# 参考

* [Set up OpenConnect VPN Server (ocserv) on Ubuntu 16.04/18.04 with Let’s Encrypt](https://www.linuxbabe.com/ubuntu/openconnect-vpn-server-ocserv-ubuntu-16-04-17-10-lets-encrypt) - 这篇是国人撰写最详尽的部署指南，非常详尽而且精确，原作者Xiao Guo An非常用心保持了文档长期更新，值得尊敬
* [Ocserv Installation - Debian, Ubuntu](https://ocserv.gitlab.io/www/recipes-ocserv-installation-Debian-Ubuntu.html)