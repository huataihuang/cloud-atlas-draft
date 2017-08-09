在完成[设置Django和Nginx uWSGI](service/nginx/setup_django_with_uwsgi_nginx.md)之后，需要设置类似Apache vhost的多站点，实现在nginx上同时支持多个uwsgi运行。

方式也很简单，将已经设置的site1.conf配置文件复制成site2.conf，修改两个位置：

* `upstream` 需要区别出2个不同的uwsgi服务，或者是端口不同，或者是不同的socket
* `location /` 需要设置 `uwsgi_pass` 分别指向不同的site

* `site1.conf`

```
upstream django_site1 {
    server unix:///home/www/site1/sock;
    # server 127.0.0.1:8000;
}

server {
    listen      80;
    server_name .site1.com; # substitute your machine's IP address or FQDN
    charset     utf-8;
    
    client_max_body_size 75M;   # max upload size

    # Django media
    location /media  {
        # your Django project's media files - amend as required
        alias /home/www/site1/media;
    }

    location /static {
        # your Django project's static files - amend as required
        alias /home/www/site1/static;
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django_site1;
        # the uwsgi_params file you installed
        include     /etc/nginx/uwsgi_params; 
    }
}
```

* `site2.conf`

```
upstream django_site2 {
    server unix:///home/www/site2/sock;
    # server 127.0.0.1:8000;
}

server {
    listen      80;
    server_name .site2.com; # substitute your machine's IP address or FQDN
    charset     utf-8;
    
    client_max_body_size 75M;   # max upload size

    # Django media
    location /media  {
        # your Django project's media files - amend as required
        alias /home/www/site2/media;
    }

    location /static {
        # your Django project's static files - amend as required
        alias /home/www/site2/static;
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django_site2;
        # the uwsgi_params file you installed
        include     /etc/nginx/uwsgi_params; 
    }
}
```

* 启动nginx

```
systemctl start nginx
```

# 设置两个提供不同socket的uwsgi

* site1_uwsgi.ini

```
[uwsgi]

# Django-related settings
# the base directory (full path)
chdir           = /home/www/site1
# Django's wsgi file
module          = site1.wsgi
# the virtualenv (full path)
home            = /home/huatai/venv

# process-related settings
# master
master          = true
# maximum number of worker processes
processes       = 10
# the socket (use the full path to be safe
socket          = /home/www/site1/sock
# ... with appropriate permissions - may be needed
chmod-socket    = 664
# clear environment on exit
vacuum          = true
```

然后执行 `uwsgi --ini site1_uwsgi.ini`

* site2_uwsgi.ini

```
[uwsgi]

# Django-related settings
# the base directory (full path)
chdir           = /home/www/site2
# Django's wsgi file
module          = site1.wsgi
# the virtualenv (full path)
home            = /home/huatai/venv

# process-related settings
# master
master          = true
# maximum number of worker processes
processes       = 10
# the socket (use the full path to be safe
socket          = /home/www/site2/sock
# ... with appropriate permissions - may be needed
chmod-socket    = 664
# clear environment on exit
vacuum          = true
```

然后执行 `uwsgi --ini site2_uwsgi.ini`

> 实际差别是在不同的目录下提供不同的 uwsgi socket，以便针对提供不同的django project服务