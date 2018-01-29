在CentOS 5的软件仓库中没有包含Nginx，是通过Fedora EPEL软件仓库安装。

以下是手工下载相关软件包安装步骤：

```
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-all-modules-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-filesystem-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-mod-http-geoip-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-mod-http-image-filter-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-mod-http-perl-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-mod-http-xslt-filter-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-mod-mail-1.10.2-1.el5.x86_64.rpm
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/nginx-mod-stream-1.10.2-1.el5.x86_64.rpm
```

```
sudo yum install nginx-*.rpm
```

> 如果服务器可以直接访问Internet，可以通过yum软件仓库方式安装：

```
wget https://mirrors.rit.edu/fedora/archive/epel/5/x86_64/epel-release-5-4.noarch.rpm
sudo rpm -ivh epel-release-5-4.noarch.rpm

sudo yum install nginx
```

# 参考

* [Websites with Nginx on CentOS 5](https://linode.com/docs/web-servers/nginx/websites-with-nginx-on-centos-5/)