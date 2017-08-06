虽然直接使用Django作为开发环境也可以，但是为了能够模拟线上生产环境，还是搭建Nginx结合uWSGI来实现：

```
the web client <-> the web server <-> the socket <-> uwsgi <-> Django
```

# 准备工作

* 启用virtualenv - 这里设置虚拟环境的名字是 venv ，也可以用其他名字

```
virtualenv venv
cd venv
source bin/activate
```

* 安装Django到这虚拟环境

> 注意：我的实践案例是将Django的站点部署在 `/home/huatai/works/mysite`

```
pip install Django
cd ~/works
django-admin.py startproject mysite
cd mysite
```

# uWSGI基本安装和配置

* 在虚拟环境安装uWSGI

```
pip install uwsgi
```

* 安装nginx

```
yum install nginx
```

> 注意：参考[centos部署nginx php](deploy_nginx_php_on_centos)对于没有开启IPv6的系统，需要注释掉`nginx.conf`中的`#listen       [::]:80 default_server;`。
>
> 注意：默认CentOS7开启了防火墙，需要增加端口访问：

```
sudo firewall-cmd --zone=public --add-port=80/tcp --permanent
sudo firewall-cmd --reload
```

# 配置nginx

* `/etc/nginx/conf.d/mysite_niginx.conf` 配置如下

```
# the upstream component nginx needs to connect to
upstream django {
    # server unix:///path/to/your/mysite/mysite.sock; # for a file socket
    server unix:///nfs-data/dev-7/huatai/works/mysite/sock;
    # server 127.0.0.1:8000; # for a web port socket (we'll use this first)
}

# configuration of the server
server {
    # the port your site will be served on
    # listen      8000;
    listen      80;
    # the domain name it will serve for
    server_name .example.com; # substitute your machine's IP address or FQDN
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    location /media  {
        # alias /path/to/your/mysite/media;  # your Django project's media files - amend as required
        alias /nfs-data/dev-7/huatai/works/mysite/media;
    }

    location /static {
        # alias /home/huatai/works/mysite/static; # your Django project's static files - amend as required
        alias /nfs-data/dev-7/huatai/works/mysite/static;
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        # include     /path/to/your/mysite/uwsgi_params; # the uwsgi_params file you installed
        include     /etc/nginx/uwsgi_params; # the uwsgi_params file you installed
    }
}
```

* 部署静态文件

在运行nginx之前，还需要在static目录搜集所有Django静态文件，也就是编辑`mysite/settings.py`配置添加

```
STATIC_ROOT = os.path.join(BASE_DIR, "static/")
```

> 上述配置是 `STATIC_URL = '/static/'`之后，也就是如下配置

```
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static/")
```

然后运行

```
python manage.py collectstatic
```

执行该命令之后，会自动在`/home/huatai/works/mysite` 下创建 `static` 子目录

* 运行Django

```
uwsgi --socket /nfs-data/dev-7/huatai/works/mysite/sock --module mysite.wsgi --chmod-socket=664
```

如果要简化启动时候参数传递，则在`/home/huatai/works/mysite`下增加`mysite_uwsgi.ini`配置（这里设置10个并发线程）

```
# mysite_uwsgi.ini file
[uwsgi]

# Django-related settings
# the base directory (full path)
chdir           = /home/huatai/works/mysite
# Django's wsgi file
module          = mysite.wsgi
# the virtualenv (full path)
home            = /home/huatai/venv

# process-related settings
# master
master          = true
# maximum number of worker processes
processes       = 10
# the socket (use the full path to be safe
socket          = /nfs-data/dev-7/huatai/works/mysite/sock
# ... with appropriate permissions - may be needed
chmod-socket    = 664
# clear environment on exit
vacuum          = true
```

然后执行

```
uwsgi --ini mysite_uwsgi.ini
```

* 重新启动nginx

```
sudo systemctl restart nginx
```

此时，通过 http://example.com 或者主机的IP地址就可以访问到django的页面


# 参考

* [设置Django和Nginx uWSGI](../service/nginx/setup_django_with_uwsgi_nginx)