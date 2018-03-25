# 准备

在Mac OS X上安装Varnish是通过[brew](https://brew.sh/)(即Homebrew)来实现的。当然，由于`brew`需要变易软件，所以你的系统还需要预先安装好Xcode编译工具。

```
xcode-select --install
```

> [Homebrew](https://brew.sh/)是macOS平台上的包管理工具，可以用来移植（编译安装）大量的GNU/Linux软件。

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

* 安装必要的编译工具：

```
brew install autoconf
brew install python
pip install docutils
brew install pcre
brew install pkg-config
brew install libmicrohttpd
brew install libtool
```

# 编译和安装

```
./autogen.sh
./configure
make
sudo make install
```

> 注意：在macOS上，默认的环境locale是`UTF-8`，需要在编译时修改成Linux所使用的`en_US.UTF-8`，例如：

```
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
```

否则可能报错`ValueError: unknown locale: UTF-8`

当Varnish编译完成后，进入`Varnish-Agent`目录，然后执行以下命令：

```
./autogen.sh
./configure
make
sudo make install
```

# 启动Varnish和Varnish-Agnet

* 假设我们在后端启动一个简单的Python WEB服务

```
python -m SimpleHTTPServer
```

* 然后启动`varnish`和`varnish-agent`：

```
sudo varnishd -a :80 -b 0.0.0.0:8000
sudo varnish-agent -u user -d
```

> Varnish的默认配置文件位于`/usr/local/etc/varnish/default.vcl`

# 参考

* [Install Varnish Cache 4 and Varnish-Agent 4 on Mac OS](https://info.varnish-software.com/blog/install-varnish-cache-4-and-varnish-agent-4-mac-os)
* [How to speed up Apache with Varnish HTTP cache on Ubuntu 16.04 LTS](https://www.howtoforge.com/tutorial/how-to-install-and-configure-varnish-with-apache-on-ubuntu-1604/) - 在Ubuntu上配置Varnish