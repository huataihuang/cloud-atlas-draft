在Ubuntu系统中安装软件，通过选择最快的镜像软件仓库可以提高效率。

# 国家代码

最简单实现加速软件仓库软件包下载的方法是确保在`/etc/apt/sources.list`中Ubuntu镜像定义包含相关的国家代码最接近你所在的位置。例如，你可以在`/etc/apt/sources.list`中找到美国的Ubuntu镜像

```
deb http://us.archive.ubuntu.com/ubuntu/ xenial main restricted
```

如果你不在美国，可以将`us`替换成你所在国家，例如`cn`表示中国，可以修改成

```
deb http://cn.archive.ubuntu.com/ubuntu/ xenial main restricted
```

# 使用镜像协议

在`/etc/apt/sources.list`中使用镜像协议可以使得`apt`命令从你所在国家获取镜像。

例如，将`/etc/apt/sources.list`中配置的协议`http://`修改成`mirror://`。即，将：

```
deb http://us.archive.ubuntu.com/ubuntu/ xenial main restricted
```

修改成

```
deb mirror://mirrors.ubuntu.com/mirrors.txt xenial main restricted
```

重复以上修改，将整个`/etc/apt/sources.list`中的`http://`都修改成`mirror://`。也可以使用如下`sed`命令一次修改完成：

```
sudo sed -i -e 's/http:\/\/us.archive/mirror:\/\/mirrors/' -e 's/\/ubuntu\//\/mirrors.txt/' /etc/apt/sources.list
```

# 手工apt镜像选择

以上是简单的选择快速镜像的方法。然而，也可以手工选择镜像网站。

以下是使用`wget`命令获取apt ubuntu mirrors：

```
wget -qO - mirrors.ubuntu.com/mirrors.txt
```

然后手工修改`/etc/apt/sources.list`

# 使用`netselect`选择最快镜像网站

`netselect`软件包可以从Debian stable仓库获取：

```
sudo apt-get install wget

wget http://ftp.au.debian.org/debian/pool/main/n/netselect/netselect_0.3.ds1-26_amd64.deb

sudo dpkg -i netselect_0.3.ds1-26_amd64.deb
```

然后就可以通过`netselect`命令通过ping icmp延迟定位到最快的镜像网站。

```
sudo netselect -s 20 -t 40 $(wget -qO - mirrors.ubuntu.com/mirrors.txt)
```

例如你会看到类似如下输出：

```
12 http://ubuntu.uberglobalmirror.com/archive/
20 http://ubuntu.mirror.serversaustralia.com.au/ubuntu/
21 http://ubuntu.mirror.digitalpacific.com.au/archive/
...
```

然后你就可以手工修改`/etc/apt/sources.list`将最快的结果替换软件安装源。也可以使用`sed`命令替换：

```
sudo sed -i 's/http:\/\/us.archive.ubuntu.com\/ubuntu\//http:\/\/ubuntu.uberglobalmirror.com\/archive\//' /etc/apt/sources.list
```

# 参考

* [How to select the fastest apt mirror on Ubuntu Linux](https://linuxconfig.org/how-to-select-the-fastest-apt-mirror-on-ubuntu-linux)