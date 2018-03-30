在[设置Django和Nginx uWSGI](setup_django_with_uwsgi_nginx)之后，使用`curl`测试程序基本功能运行正常。

程序通过[Django REST framwork过滤](develop/python/django/rest_framework/filtering.md)实现查询，在少量数据时工作正常，但是发现当根据时间范围查询大量数据时，返回的JSON数据被截断。从返回的数据来看，只获取到21K数据：

```
-rw-r--r-- 1 huatai.huang users  21K Mar 29 22:14 test.log
```

最初我以为是Nginx默认限制文件下载大小，但是实际上这个数据量实在太小，和以往配置Nginx+PHP默认2M下载数据量差别太大。

检查Nginx日志，发现数据被截断时，`error.log`日志如下：

```
==> error.log <==
2018/03/29 22:28:43 [crit] 14664#0: *48 open() "/var/lib/nginx/tmp/uwsgi/1/00/0000000001" failed (13: Permission denied) while reading upstream, client: 192.168.0.37, server: myapp.example.com, request: "GET /api/func/?time__gte=2018-03-20+11%3a58 HTTP/1.1", upstream: "uwsgi://unix:///home/admin/venv2/sock:", host: "myapp-local.example.com"
```

这里日志显示Nginx访问上游的uWSGI出现报错，看上去像是权限问题（`Permission denied`），但是数据量少的时候却不报错。

检查Nginx配置文件，其中

```
upstream django {
    server unix:///home/admin/venv2/sock;
}

server {
    listen      80;
    server_name myapp.example.com myapp-local.example.com;
    charset     utf-8;
    client_max_body_size 75M;
    ...
    location / {
        uwsgi_pass  django;
        include     /etc/nginx/uwsgi_params;
    }
}
```

检查`socks`文件属性：

```
#ls -lh /home/admin/venv2/sock
srwxr-xr-x 1 admin admin 0 Feb 28 16:03 /home/admin/venv2/sock
```

可以看到`sock`文件属主是`admin`，和在`nginx.conf`中配置的nginx运行进程的属主相同：

```
user admin;
```

并且也可以看到`ps aux | grep nginx`显示进程是以`admin`用户身份运行：

```
#ps aux | grep nginx
root      1596  0.0  0.0  69420   808 pts/0    S+   23:10   0:00 grep nginx
root     14663  0.0  0.0 112924  2068 ?        Ss   22:27   0:00 nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
admin    14664  0.0  0.0 113392  3148 ?        S    22:27   0:00 nginx: worker process
admin    14665  0.0  0.0 113392  2704 ?        S    22:27   0:00 nginx: worker process
...
```

少量的数据请求则完全正确，例如返回只有一条JSON记录时。

# 排查：临时文件的权限问题

注意到报错集中在出现临时文件的时候

```
open() "/var/lib/nginx/tmp/uwsgi/1/00/0000000001" failed
```

当数据量少的时候，则没有临时文件，说明只在uWSGI需要返回给客户端大量数据时候才会在磁盘中生成临时文件。但是这个临时文件无法打开。

由于nginx进程是使用`admin`用户运行的，而`/var/lib`目录下的子目录通常会限制在`root`用户访问，所以检查相应的父目录权限：

```
#ls -lh /var/lib | grep nginx
drwx------ 3 nginx   nginx   4.0K Jan 25 16:01 nginx

#ls -lhR /var/lib/nginx
/var/lib/nginx:
total 4.0K
drwx------ 7 nginx nginx 4.0K Jan 25 20:12 tmp

/var/lib/nginx/tmp:
total 20K
drwx------ 2 admin root 4.0K Jan 25 20:12 client_body
drwx------ 2 admin root 4.0K Jan 25 20:12 fastcgi
drwx------ 2 admin root 4.0K Jan 25 20:12 proxy
drwx------ 2 admin root 4.0K Jan 25 20:12 scgi
drwx------ 2 admin root 4.0K Jan 25 20:12 uwsgi

/var/lib/nginx/tmp/client_body:
total 0

/var/lib/nginx/tmp/fastcgi:
total 0

/var/lib/nginx/tmp/proxy:
total 0

/var/lib/nginx/tmp/scgi:
total 0

/var/lib/nginx/tmp/uwsgi:
total 0
```

## 原因分析

这是因为默认情况下安装的Nginx软件包运行时是设置进程以`nginx`用户身份运行，所以RPM包安装时会将`/var/lib/nginx`目录的属主设置为`nginx:nginx`。由于`uWSGI`使用`admin`用户身份运行，所以`sock`文件也是`admin`属主。为了能够让`nginx`进程读写`sock`文件，特别将Nginx配置中进程的属主从`nginx`修改成`admin`。

但是通过RPM包安装的Nginx的目录属主还保留着默认的`nginx:nginx`属性，所以导致`admin`用户运行的Nginx进程无法写入临时文件。通常情况下，少量数据传输不需要使用临时文件，所以问题没有显现。当需要向客户端传输大量数据时，Nginx会尝试在磁盘中缓存数据。这时就遇到了临时文件目录无法写入的报错，也就导致数据传输一半的时候被截断。

## 解决方法

既然默认的`/var/lib/nginx`目录权限不正确，修改成正确的进程对应属主名字就可以了：

```
chown -R admin:root /var/lib/nginx
```

然后再次执行`curl`指令获取数据，就可以看到返回完整的JSON数据，即使数据返回几兆大小也没有问题。