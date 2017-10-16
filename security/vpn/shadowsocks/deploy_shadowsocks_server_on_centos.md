# 变异安装程序

* 编译环境准备&安装依赖包

```
yum install -y gcc make libtool build-essential git
yum install -y curl curl-devel zlib-devel openssl-devel perl perl-devel pcre pcre-devel cpio expat-devel gettext-devel asciidoc xmlto
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

# 配置

* 准备必须的文件

```
mkdir -p /etc/shadowsocks-libev
cp ./rpm/SOURCES/etc/init.d/shadowsocks-libev /etc/init.d/shadowsocks-libev
cp ./debian/config.json /etc/shadowsocks-libev/config.json
chmod +x /etc/init.d/shadowsocks-libev
```

* 编辑配置文件

```
vim /etc/shadowsocks-libev/config.json
```

* 添加开机自启动服务

```
chkconfig --add shadowsocks-libev
chkconfig shadowsocks-libev on
```

* 启动服务

```
service shadowsocks-libev start
```

# 参考

* [shadowsocks-libev install at Debian or CentOS](https://gist.github.com/aa65535/ea090063496b0d3a1748)
