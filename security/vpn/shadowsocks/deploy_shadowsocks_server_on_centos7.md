# 编译程序

* 编译环境准备&安装依赖包

```
yum install -y gcc make libtool build-essential git

yum install -y curl curl-devel zlib-devel openssl-devel gnutls-devel \
mbedtls-devel libsodium-devel c-ares-devel libev-devel perl perl-devel \
pcre pcre-devel cpio expat-devel gettext-devel asciidoc xmlto
```

* 克隆源码

```
git clone --recursive https://github.com/shadowsocks/shadowsocks-libev.git
```

* 开始编译

```
cd shadowsocks-libev
./autogen.sh
./configure --prefix=/usr && make
make install
```

# 创建配置文件

* `/etc/shadowsocks.json`

```
{
  "server": "0.0.0.0",
  "server_port": ${SS_PORT},
  "password": "${SS_PASSWORD}",
  "method": "${SS_METHOD}",
  "local_address": "127.0.0.1",
  "local_port":1080,
  "timeout":300,
  "fast_open": false,
  "workers": 1
}
```

以上配置文件中 `${XXX}` 都是变量，按照自己的实际配置 - 在 [tianjianchn/install-shadowsocks.sh](https://gist.github.com/tianjianchn/888a610036c743c4aba2ea1e82f4a216) 中采用了脚本方式设置，可参考

```
SS_IP=`ip route get 1 | awk '{print $NF;exit}'`
SS_PORT=8050
SS_PASSWORD=$(random-string 32)
SS_METHOD=camellia-256-cfb #or camellia-256-cfb
```

注意：`"server_port": ${SS_PORT},`是指ShadowSocks服务对外提供的服务端口，务必需要确保防火墙打开了这个端口。如果是云计算的服务供应商，还可能需要在云计算的安全策略上设置运行端口访问。

# 添加Systemd服务

* 编辑`/etc/systemd/system/shadowsocks.service`

```ini
[Unit]
Description=Shadowsocks Server Service
After=syslog.target network.target auditd.service
[Service]
Type=simple
User=nobody
TimeoutStartSec=0
ExecStart=/usr/bin/ss-server -c /etc/shadowsocks.json
[Install]
WantedBy=multi-user.target
```

* 然后执行一下命令激活操作系统启动时运行

```
systemctl enable shadowsocks
```

* 启动服务

```
systemctl stop shadowsocks
systemctl start shadowsocks
```

* 检查服务

```
systemctl status shadowsocks -l
```

# 设置防火墙

在CentOS 7中添加防火墙：

*  编辑`/etc/firewalld/services/shadowsocks.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>shadowsocks</short>
  <description>Enable Shadowsocks on ${SS_PORT}/tcp.</description>
  <port protocol="tcp" port="${SS_PORT}"/>
</service>
```

* 激活

```
firewall-cmd --permanent --zone=public --add-service=shadowsocks
```

```
firewall-cmd --reload
```

# 参考

* [tianjianchn/install-shadowsocks.sh](https://gist.github.com/tianjianchn/888a610036c743c4aba2ea1e82f4a216) - 在CentOS上安装Shadowsocks的脚本，采用直接安装第三方repo提供的rpm安装
* [阿里云centos 7下搭建shadowsocks](https://segmentfault.com/a/1190000010639190)