在访问oVirt的web下载网站时，发现下载网站使用了 [h5ai](https://larsjung.de/h5ai/) 作为web文件文件的索引，非常美观，所以也尝试在自己的下载网站使用。

> 支持 Apache httpd, lighttpd, nginx 和 Cherokee，客户端可以是主流的浏览器 Chrome, Firefox, Safari, Opera 和 IE10+

> h5ai需要PHP 5.5+ 支持 [CentOS快速部署Nginx+PHP](deploy_nginx_php_on_centos)

# 安装 h5ai

* 将文件夹 _h5ai 复制到web服务器的根文档目录

* 添加 `/_h5ai/server/php/index.php` （ 注意开头的 `/` ）到默认的 index文件列表的末尾，这样h5ai就可以管理所有没有index文件的目录

以下是所有已经测试过web服务器的设置方法

* Apache httpd 2.2/2.4 配置  httpd.conf 或者 目录下的 .htaccess

```
DirectoryIndex  index.html  index.php  /_h5ai/server/php/index.php
```

* nginx 1.2 在 nginx.conf 设置

```
index  index.html  index.php  /_h5ai/server/php/index.php;
```

# 配置

> The main configuration file is _h5ai/conf/options.json. You might want to change some of the documented settings. But there are some more files in the _h5ai/conf folder you might have a look at.