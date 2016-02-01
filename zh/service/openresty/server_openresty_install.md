# OpenResty安装

`ngx_openresty`是通过源代码安装的，从[OpenResty官网](http://openresty.org)下载最新版本源代码（撰写本文时使用`1.9.7.2`）

## 编译前准备

系统中需要预先安装`perl 5.6.1+`, `libreadline`, `libpcre`, `libssl`，对于Linux，需要确保`ldconfig`程序位于执行路径环境中。

* Debian和Ubuntu用户

建议使用`apt-get`安装以下软件包

    apt-get install libreadline-dev libncurses5-dev libpcre3-dev \
    libssl-dev perl make build-essential

* Fedora和RedHat（CentOS/RHEL）用户

建议使用`yum`安装以下软件包

    yum install readline-devel pcre-devel openssl-devel gcc

* Mac OS X(Darwin)用户

建议使用[Homebrew](http://mxcl.github.com/homebrew/)安装`PCRE`和`OpenSSL`

    brew update
    brew install pcre openssl

## 编译

下载最新的`ngx_openresty`

    tar xzvf ngx_openresty-VERSION.tar.gz

> `VERSION`替换成实际的版本号，例如，我这里使用`1.9.7.2`

编译配置

   ./configure

 默认`--prefix=/usr/local/openresty`，可以在不支持`LuaJIT`的平台关闭`LuaJIT`

 也可以设置一些选项

     ./configure --prefix=/opt/openresty \
            --with-pcre-jit \
            --with-ipv6 \
            --without-http_redis2_module \
            --with-http_iconv_module \
            --with-http_postgres_module \
            -j2

目前初次编译安装，选择默认参数，只指定安装到 `/opt/openresty`

    ./configure --prefix=/opt/openresty

开始编译

    make

如果服务器多核，可以使用多核进行编译，例如，使用2个CPU core

    make -j2

安装

    make install

# 参考

* [OpenResty官方安装文档](http://openresty.org)
