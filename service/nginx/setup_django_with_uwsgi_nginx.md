Web服务直接面向外部，直接从文件系统提供文件服务（HTML，图片，CSS 等)。然而，web服务器不是直接和Django应用程序通讯，它需要某个事物来运行应用程序，从web客户端提供请求和响应返回。

Web Server Gateway Interface（Web服务器网管接口）WSGI就是完成上述工作的Python标准。

uWSGI是一个WSGI的实现，创建一个Unix Socket，服务器通过WSGI协议响应到web服务器，流程如下：

```
the web client <-> the web server <-> the socket <-> uwsgi <-> Django
```

# 设置uWSGI之前工作

* 首先要启用一个virtualenv环境 - 这里设置虚拟环境的名字是 venv ，也可以用其他名字

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

此时用命令参数`0:8000`使得端口监听

```
python manage.py runserver 0:8000
```

# uWSGI基本安装和配置

* 在虚拟环境安装uWSGI

```
pip install uwsgi
```

也可以参考 [Installing uWSGI](http://uwsgi-docs.readthedocs.io/en/latest/Install.html) 手工下载安装

```
wget https://projects.unbit.it/downloads/uwsgi-2.0.17.tar.gz
tar xfz uwsgi-2.0.17.tar.gz
cd uwsgi-2.0.17

python uwsgiconfig.py --build
```

编译以后在当前目录下有生成一个`uwsgi`二进制文件，将这个二进制文件复制到virtualenv的执行目录下，例如`~/venv2/bin/`就安装完成了：

```
cp uwsgi ~/venv2/bin/
```

* 基本测试

创建一个`test.py`：

```
def application(env, start_response):
    start_response('200 OK', [('Content-Type','text/html')])
    return [b"Hello World"] # python3
    #return ["Hello World"] # python2
```

运行uWSGI

```
uwsgi --http :8000 --wsgi-file test.py
```

此时访问 http://example.com:8000 可以看到输出内容 `Hello World`

```
the web client <-> uWSGI <-> Python
```

# 测试Django项目

在前面已经实现了Django启动功能验证

```
python manage.py runserver 0.0.0.0:8000
```

如果上述工作正常，就可以测试使用uWSGI来运行：

```
uwsgi --http :8000 --module mysite.wsgi
```

此时用浏览器访问也可以看到同样的Django工作页面。此时访问路径：

```
the web client <-> uWSGI <-> Django
```

# 基本nginx

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

此时访问方式：

```
the web client <-> the web server
```

# 配置nginx

需要使用`uwsgi_params`文件，位于`nginx`目录下，也可以从 https://github.com/nginx/nginx/blob/master/conf/uwsgi_params 获取。

> nginx 有两个配置目录：

* `/etc/nginx/conf.d/*.conf` 用于加载模块文件
* `/etc/nginx/default.d/*.conf` 用于加载默认服务器配置

较新的nginx版本，则使用`/etc/nginx/site-enabled/`目录来存放软链接到激活配置文件。

* 创建名为 `mysite_nginx.conf` 配置如下

```
# mysite_nginx.conf

# the upstream component nginx needs to connect to
upstream django {
    # server unix:///path/to/your/mysite/mysite.sock; # for a file socket
    # server 127.0.0.1:8001; # for a web port socket (we'll use this first)
    server 127.0.0.1:8000; #这里我启用标准8000端口，也可以运行多个不同端口负载均衡
}

# configuration of the server
server {
    # the port your site will be served on
    # listen      8000;
    listen      80; #这里我启用标准80端口方便访问
    # the domain name it will serve for
    server_name .example.com; # substitute your machine's IP address or FQDN
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    # 注意：由于nginx需要直接访问文件系统目录，所以务必确保目录可对nginx用户读取
    # 生产环境务必规划好目录访问权限
    location /media  {
        # alias /path/to/your/mysite/media;  # your Django project's media files - amend as required
        alias /nfs-data/dev-7/huatai/works/mysite/media;
    }

    location /static {
        # alias /path/to/your/mysite/static; # your Django project's static files - amend as required
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

如果是新版本nginx，可以将自定义配置文件软链接到`/etc/nginx/sites-enabled`目录下

```
sudo ln -s ~/path/to/your/mysite/mysite_nginx.conf /etc/nginx/sites-enabled/
```

如果是老版本nginx，则将自定义文件软链接到`/etc/nginx/conf.d/`目录下

```
sudo ln -s ~/virtman/virtman_nginx.conf /etc/nginx/conf.d/
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

* 重新启动nginx

```
sudo systemctl restart nginx
```

* 另外，要验证多媒体文件是否可以正常访问，则在 `/home/huatai/works/mysite` 下创建 `media` 目录，然后存放一个 `test.png` 文件，然后通过 http://example.com/media/test.png 访问验证。

* 前述已经启动了uwsgi，如下

```
uwsgi --http :8000 --wsgi-file test.py
```

此时就可以通过 http://example.com 访问到这个`Hello world`页面

# uWSGI响应缓慢超时问题排查

遇到nginx转发给uWSGI之后，长时间没有响应的问题(仅测试 test.py 无计算，理论速度应该极快)，通过替换直接运行 django 可以看到nginx确实是转发给后端的uwsgi。然而，访问 http://example.com 长时间超时无响应。

页面提示:`504 Gateway Time-out`，而在nginx日志中有报错

```
2017/07/31 15:15:04 [error] 31050#0: *22 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.44.87, server: example.com, request: "GET / HTTP/1.1", upstream: "uwsgi://127.0.0.1:8000", host: "example.com"
2017/07/31 15:20:51 [error] 31050#0: *26 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 192.168.44.87, server: example.com, request: "GET / HTTP/1.1", upstream: "uwsgi://127.0.0.1:8000", host: "example.com"
```

检查配置文件，如下配置看确实是转发给上游8000端口：

```
upstream django {
    # server unix:///path/to/your/mysite/mysite.sock; # for a file socket
    # server 127.0.0.1:8001; # for a web port socket (we'll use this first)
    server 127.0.0.1:8000; # for a web port socket (we'll use this first)
}
```

但是直接访问 http://example.com:8000 响应非常快速。（通过替换默认的额django ）

参考 [How to debug python application under uWSGI?](https://stackoverflow.com/questions/18427948/how-to-debug-python-application-under-uwsgi) 可以看到，uWSGI默认是关闭了`stdin`（重定向到 /dev/null），如果需要`stdin`添加 `--honour-stdin`

> 暂时没有解决这个nginx访问 wsgi 的 http 端口问题，不过，采用 socket 方法验证通过，所以当前使用 socket 方法。

# 通过socket使用uWSGI

```
uwsgi --socket /nfs-data/dev-7/huatai/works/mysite/sock --wsgi-file test.py --chmod-socket=664
```

> 注意：这里需要设置 `--chmod-socket=664` 以便能够让同属于一个用户组的 nginx 进程可以读写这个socket。

# 结合uwsgi和nginx使用Django应用程序

上述测试`test.py`成功后，就可以开始运行Django应用程序了：

```
uwsgi --socket /nfs-data/dev-7/huatai/works/mysite/sock --module mysite.wsgi --chmod-socket=664
```

此时，通过 http://example.com 或者主机的IP地址就可以访问到django的页面

# 通过 .ini 配置文件运行uWSGI

创建 `mysite_uwsgi.ini`

```
# mysite_uwsgi.ini file
[uwsgi]

# Django-related settings
# the base directory (full path)
chdir           = /home/huatai/works/mysite
# Django's wsgi file
module          = project.wsgi
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
# chmod-socket    = 664
# clear environment on exit
vacuum          = true
```

然后执行

```
uwsgi --ini mysite_uwsgi.ini
```

注意：对于不使用virtualenv的环境，`base = /home/huatai/works/mysite`需要改成 `chdir = /home/huatai/works/mysite`，这样，uWSGI会使用`chdir`替代当前目录。

# 参考

* [Setting up Django and your web server with uWSGI and nginx](http://uwsgi-docs.readthedocs.io/en/latest/tutorials/Django_and_nginx.html)