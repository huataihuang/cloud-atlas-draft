迁移了一个Django项目的Docker容器，发现运行存在问题，所以重建了`virtualenv`环境。多个Django项目中，其中有一个Django运行出现异常：

```
[20/Mar/2018 12:38:41] code 400, message Bad request syntax ('\x00\xf9\x02\x00\x0c\x00QUERY_STRING\x00\x00\x0e\x00REQUEST_METHOD\x03\x00GET
...
Traceback (most recent call last):
  File "/usr/local/lib/python2.7/logging/__init__.py", line 861, in emit
    msg = self.format(record)
  File "/usr/local/lib/python2.7/logging/__init__.py", line 734, in format
    return fmt.format(record)
  File "/data/myapp_admin/venv2/lib/python2.7/site-packages/django/utils/log.py", line 192, in format
    return super(ServerFormatter, self).format(record)
  File "/usr/local/lib/python2.7/logging/__init__.py", line 476, in format
    raise e
UnicodeDecodeError: 'ascii' codec can't decode byte 0xf9 in position 9: ordinal not in range(128)
```

这个问题看上去像是客户端请求中包含了Unicode字符，但是服务器端恢复`virtualenv`环境没有支持？

google了一些文档，发现很多都指向了http请求中出现https，原因和nginx反向`uwsgi_pass`给Django有关，似乎是客户端试图以`https`访问`http`导致的问题。 - 参考 [strange UnicodeDecodeError on django](https://stackoverflow.com/questions/18940441/strange-unicodedecodeerror-on-django)

检查了nginx配置：

```nginx
upstream django_perfree {
    server 127.0.0.1:8080;
}

server {
    listen      80;
    server_name myapp.example.com;
    charset     utf-8;
    client_max_body_size 75M;
    location /media  {
        alias /home/admin/perfree/media;
    }
    location /static {
        alias /home/admin/perfree/static;
    }
```

# HAProxy

然而，在检查访问链路的时候，发现了一些和线上不同的区别：

* 虽然nginx配置和线上相似，但是线上环境是直接访问 nginx 反向代理到后端 `uwsgi` 运行的 `8080` 端口
* 线下开发环境是自己搭建的Docker环境，但是为了模拟复杂的网络环境，并且能够运行不同的测试环境，我采用了Docker来运行测试机，而且将Docker所在的主机放置在一台运行了HAProxy的主机（`gw-1`）之后再连接到局域网：
  * 模拟前端有防火墙的Internet服务，在`gw-1`上启用了Ubuntu UFW（[使用ufw配置NAT masquerade](../../../../os/linux/network/firewall/ufw/nat_masquerade_in_ufw)）
  * `gw-1`上使用HAProxy反向代理到`svr-1`上运行的Docker容器映射端口

```
listen mydjango
    bind 192.168.44.11:80
    mode tcp
    balance roundrobin
    server mydjango-1 192.168.0.2:80 check
```

[Haproxy Charset](https://pleasantprogrammer.com/posts/haproxy-charset.html) 似乎说明HAProxy实际上默认使用UTF-8作为文本存储和渲染。

暂时停止`gw-1`上HAProxy，然后暂时使用ufw端口映射来替代这个反向代理。编辑`/etc/ufw/before.rules`添加到

```
# nat Table rules
*nat
:PREROUTING ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]

...
-A PREROUTING -i wlp3s0 -p tcp --dport 80 -j DNAT --to-destination 192.168.0.2
```

但是发现使用ufw直接转发HTTP访问（没有使用HAProxy）依然出现同样的报错信息。看来，不是HAProxy代理的原因。

# 暂时绕开

由于不经过nginx反向代理，直接访问Django 8080端口是可以正常工作，所以修改docker，重建端口映射，直接将Docker 8001端口映射给Django 8001端口来运行应用。

```
docker commit myapp local:myapp
docker stop myapp
docker rm myapp

docker run -it -p 221:22 -p 801:80 -p 4431:443 -p 8081:8080 --hostname myapp \
--name myapp -v share-data:/data local:myapp /bin/bash
```

然后在防火墙`gw-1`上修改映射

```
-A PREROUTING -i wlp3s0 -p tcp --dport 8081 -j DNAT --to-destination 192.168.0.2
```

暂时绕过nginx反向代理到Django端口运行到问题，采用直接访问Django 8080端口来测试。