> OSS是阿里云提供的面向对象海量存储，本文提供Python SDK安装以及osscmd（python版本）的安装简介。
>
> 按照官方文档：osscmd是基于 Python 2.x 的命令行工具，支持Bucket管理、文件管理等功能，非必要场景下建议使用 [ossutil](https://help.aliyun.com/document_detail/50452.html?spm=5176.doc32184.2.4.hgJ9iC) (Go语言版本，效率更高) 代替osscmd（Python版本）。
>
> 因为我使用量不大，为方便采用osscmd。

# 安装OSS Python SDK

> * osscmd支持的运行环境包括Python 2.5/2.6/2.7，不支持Python 3.x
> * osscmd在Python SDK 0.x基础上开发，不再支持新功能，只进行BUG修改

> 本文安装实践在Fedora 26上完成，默认Python版本是 2.7.13

* （取消）通过pip安装是最为简便的，但是提供的不是最新oss 0.x版本，导致无法正常运行osscmd

```
sudo pip install oss
```

> 注意：必须安装`oss`（可选安装`oss2`以支持一些python开发，实际`osscmd`是基于`oss 0.x`开发的，所以只安装`oss2`没法运行`osscmd`）

* (实际采用此方法)从阿里云官网下载[Python SDK开发包](https://help.aliyun.com/document_detail/32171.html?spm=5176.doc32184.2.7.0NDCn6)解压缩zip包进行安装

```
unzip OSS_Python_API_20160419.zip
sudo python setup.py install
sudo mv osscmd /usr/bin/
```

现在就可以使用`osscmd`指令了。

# 运行报错排查

运行`osscmd`可能会遇到如下报错：

```
  File "/usr/bin/osscmd", line 40, in <module>
    TOTAL_PUT = AtomicInt()
NameError: name 'AtomicInt' is not defined
```

> 晕倒，`pip安装的oss不是最新版本`，还是需要从官网手工下载[Python SDK开发包(2016-04-19) 版本 0.4.6](https://help.aliyun.com/document_detail/32171.html?spm=5176.doc32184.2.7.0NDCn6)进行安装。即上述方法二！！！

----

# ossutil安装

> 当前阿里云已经不再提供python版本osscmd，这个工具功能已经整合到 ossutil 中(GO) ，所以之前的osscmd安装步骤可能已经无法进行。这里补充一下ossutil安装(其实就是下载，修改执行权限，运行)

[阿里云命令行工具ossutil > 下载和安装](https://help.aliyun.com/document_detail/120075.html?spm=a2c4g.11186623.6.844.5a381bd2BviixZ)

* [ossutil在github开源](https://github.com/aliyun/ossutil)
* 二进制执行提供Windows/Linux/Mac平台
* 支持架构：x86（32bit、64bit）、ARM（32bit、64bit）

- 安装

```
wget http://gosspublic.alicdn.com/ossutil/1.6.19/ossutil64
chmod 755 ossutil64
sudo mv ossutil64 /usr/bin/ossutil
```

- 执行配置

```
./ossutil config
```

# 参考

* [osscmd 快速安装](https://help.aliyun.com/document_detail/32184.html?spm=5176.doc32171.2.6.kcTPtw)