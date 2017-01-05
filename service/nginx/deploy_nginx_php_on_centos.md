在 [h5ai-时尚的HTTP服务器索引](#h5ai-时尚的HTTP服务器索引) 一文中提到了h5ai 运行环境需要web服务器支持php，所以在软件仓库环境web下载页面部署Nginx 和 PHP。

> LEMP stack is a group of open source software to get web servers up and running. The acronym stands for Linux, nginx (pronounced Engine x), MySQL, and PHP.

# 安装软件仓库

```
sudo yum install epel-release
```

> 也可以使用 nginx 官方网站提供的nginx软件库

# 安装MySQL

```
sudo yum install mysql-server
sudo /etc/init.d/mysqld restart
```

默认的安装包提供了一些交互配置MySQL的脚本

```
sudo /usr/bin/mysql_secure_installation
```

> 作为下载站点，这步跳过

# 安装nginx

```
sudo yum install nginx
sudo systemctl start nginx
```

遇到报错，则使用`systemctl status nginx.service`检查。

曾经遇到以下报错

```
Jan 02 23:06:01 testtfs-1-3.sqa.ztt nginx[10545]: nginx: [emerg] socket() [::]:80 failed (97: Address family not supported by protocol)
Jan 02 23:06:01 testtfs-1-3.sqa.ztt nginx[10545]: nginx: configuration file /etc/nginx/nginx.conf test failed
Jan 02 23:06:01 testtfs-1-3.sqa.ztt systemd[1]: nginx.service: control process exited, code=exited status=1
Jan 02 23:06:01 testtfs-1-3.sqa.ztt systemd[1]: Failed to start The nginx HTTP and reverse proxy server.
```

这是因为主机没有配置支持IPv6，所以需要如下更改注释掉`listen       [::]:80 default_server;`

```
    server {
        listen       80 default_server;
        #listen       [::]:80 default_server;
        server_name  _;
        root         /usr/share/nginx/html;
```

# 安装PHP

```
sudo yum install php-fpm php-mysql
```

# 配置PHP

编辑 `/etc/php.ini` ，修改 `cgi.fix_pathinfo=1` 将 `1` 改成 `0`

```
cgi.fix_pathinfo=0
```

> cgi.fix_pathinfo 设置为1，则php解析器将尽可能处理请求相近的文件，这会导致安全隐患。如果设置为0，则要求解析器完全匹配文件路径，这样更为安全。

## 升级 PHP

在[h5ai-时尚的HTTP服务器索引](#h5ai-时尚的HTTP服务器索引) 中，要求PHP 5.5以上版本。在CentOS 7平台，当前还只提供了 5.4.16版本不能满足要求。所以需要通过第三方安装仓库。

> 参考 [PHP 5.6 on CentOS/RHEL 7.2 and 6.8 via Yum](https://webtatic.com/packages/php56/)，使用第三方webtatic提供的软件包

```
rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm

yum install php56w-fpm
```

如果要替代已经安装的`php-fpm`则执行以下命令（不需要执行`yum install php56w-fpm`，就会自动替换已经安装的`php-fpm`）

```
yum install yum-plugin-replace
yum replace php-common --replace-with=php56w-common
```

# 配置 nginx

设置 `/etc/nginx/nginx.conf` ，将 `worker` 处理进程设置为16(我这里设置为处理数量的一半) ，或者设置成`auto`则自动配置成和处理器相同的树枝

配置nginx默认虚拟主机 ，编辑 /etc/nginx/nginx.conf

```
# pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
#
location ~ \.php$ {
    root           /usr/share/nginx/html;
    fastcgi_pass   127.0.0.1:9000;
    fastcgi_index  index.php;
    fastcgi_param  SCRIPT_FILENAME   $document_root$fastcgi_script_name;
    include        fastcgi_params;
}
```

编辑 /etc/php-fpm.d/www.conf

```
user = nginx
group = nginx
```

将默认的apache用户和组替换成nginx

# 启动

```
sudo systemctl restart php-fpm
sudo systemctl restart nginx
```

# 参考

* [How To Install Linux, nginx, MySQL, PHP (LEMP) stack on CentOS 6](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-centos-6)
* [How To Install Linux, Nginx, MySQL, PHP (LEMP) stack On CentOS 7](https://www.digitalocean.com/community/tutorials/how-to-install-linux-nginx-mysql-php-lemp-stack-on-centos-7) - 主要参考
* [How To Install Nginx With PHP5 (And PHP-FPM) And MySQL Support On CentOS 6.5](https://www.howtoforge.com/how-to-install-nginx-with-php5-and-php-fpm-and-mysql-on-centos-6.5)
* [How To Install Nginx With PHP And MySQL (LEMP Stack) On CentOS 7](https://www.howtoforge.com/how-to-install-nginx-with-php-and-mysql-lemp-stack-on-centos-7)