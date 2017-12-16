> 本文参考[shadowsocks-libev install at Debian or CentOS](https://gist.github.com/aa65535/ea090063496b0d3a1748)，但是在CentOS 7上略有不同，所以此处先记录，再单独整理一份CentOS7部署。

# 编译程序

* 编译环境准备&安装依赖包

```
yum install -y gcc make libtool build-essential git

yum install -y curl curl-devel zlib-devel openssl-devel gnutls-devel mbedtls-devel libsodium-devel c-ares-devel libev-devel \
perl perl-devel pcre pcre-devel cpio expat-devel gettext-devel asciidoc xmlto
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

* 如果遇到报错:
  * `configure: error: mbed TLS libraries not found.`，参考[服务器安装影梭时error: mbed TLS libraries not found](http://ask.csdn.net/questions/367883)，安装`mbedtls-devel`
  * `configure: error: The Sodium crypto library libraries not found.`，则安装`libsodium-devel`
  * `configure: error: The c-ares library libraries not found.`，则安装`c-ares-devel`
  * `configure: error: Couldn't find libev. Try installing libev-dev[el].`，则安装`libev-devel`

# 配置

* 准备必须的文件

```
mkdir -p /etc/shadowsocks-libev
cp ./rpm/SOURCES/etc/init.d/shadowsocks-libev /etc/init.d/shadowsocks-libev
cp ./debian/config.json /etc/shadowsocks-libev/config.json
chmod +x /etc/init.d/shadowsocks-libev
```

> 这里方法采用了rc.d执行脚本，适合早期CentOS6系列操作系统。CentOS 7系统参考[在CentOS 7上部署ShadowSocks服务器](deploy_shadowsocks_server_on_centos7)

* 创建文件命令

```
vi /etc/shadowsocks-libev/config.json
```

内容参考如下：

单端口：

```
 {
 "server":"0.0.0.0",            --服务器IP，直接用0.0.0.0也可
 "server_port":8888,            --服务器端口
 "local_address": "127.0.0.1",  --本地地址，可省略
 "local_port":1080,             --本地端口，可省略
 "password":"password",         --密码
 "timeout":300,                 --超时时间，可省略
 "method":"aes-256-cfb",        --加密策略，有多重策略，具体自查
}
```

> 注意：

  * `"server_port":8888`是对外提供服务的端口（可自行修改），要保证没有防火墙阻碍
  * `"local_port":1080,`是ss客户端在本地提供的sockes代理端口

多端口：

```
{
    "server":"0.0.0.0",
    "local_address":"127.0.0.1",
    "local_port":1080,
    "port_password":{           --每个端口对应一个密码
        "1111":"password1",
        "1112":"password2",
        "1113":"password3"
    },
    "timeout":300,
    "method":"aes-256-cfb",
    "fast_open":false
}
```

* 添加开机自启动服务

如果采用init脚本，则可以使用：

```
chkconfig --add shadowsocks-libev
chkconfig shadowsocks-libev on
```

* 启动服务

```
service shadowsocks-libev start
```

> 注意：客户端Shadow Socket连接以后，需要设置客户端proxy指向自己本机的`1080`端口。如果客户端软件自动设置则ok，否则要想办法手工设置。

[Ubuntu Touch设置网络Proxy方法](../../../develop/ubuntu_touch/ubuntu_touch_proxy_setup)

# 参考

* [shadowsocks-libev install at Debian or CentOS](https://gist.github.com/aa65535/ea090063496b0d3a1748)
* [tianjianchn/install-shadowsocks.sh](https://gist.github.com/tianjianchn/888a610036c743c4aba2ea1e82f4a216) - 在CentOS上安装Shadowsocks的脚本，采用直接安装第三方repo提供的rpm安装
* [阿里云centos 7下搭建shadowsocks](https://segmentfault.com/a/1190000010639190)