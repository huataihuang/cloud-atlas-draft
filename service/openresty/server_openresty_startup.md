# OpenResty快速起步

本文简述快速配置OpenRetry提供WEB的服务，方法类似Nginx，如果熟悉Nginx，可跳到后续文档阅读。

**配置案例是用于个人开发测试环境，测试端口8080**

# HelloWorld

准备配置目录（这里设置为`~/work`）

    mkdir ~/work
    cd ~/work
    mkdir logs/ conf/

准备最简单的配置

    worker_processes  1;
    error_log logs/error.log;
    events {
        worker_connections 1024;
    }
    http {
        server {
            listen 8080;
            location / {
                default_type text/html;
                content_by_lua '
                    ngx.say("<p>hello, world</p>")
                ';
            }
        }
    }

> OpenRetry是通过模块实现的Nginx的增强版本，所以可以完全使用标准的Nginx模块，也可以看到和Nginx相似的配置

`启动Nginx服务`

在个人`PATH`中添加所安装的OpenRetry执行路径（例如添加到`~/.bash_rc`中）

    PATH=/opt/openresty/nginx/sbin:$PATH
    export PATH

然后重新登录控制台，再执行

    nginx -p `pwd`/ -c conf/nginx.conf

> 注意：这里参数 **-p `pwd`/** 表示在当前目录，也就是`~/work`，启动服务后会自动在当前目录下创建必要的临时文件

    client_body_temp  conf  fastcgi_temp  logs  proxy_temp  scgi_temp  uwsgi_temp

此时访问 http://localhost:8080/ 可以看到输出 `hello,world`

# 性能测试

    http_load -p 10 -s 5 http://localhost:8080/

# 生产配置

OpenRetry的默认配置位于安装目录`nginx/conf`子目录，即`nginx.conf`，可以在这个基础上进行调整。

配置方法可以参考

* [Nginx Full Example Configuration](https://www.nginx.com/resources/wiki/start/topics/examples/full/#)
* [Nginx wiki](https://www.nginx.com/resources/wiki/start/) - 提供了常见应用的配置案例

**默认的OpenRetry的`nginx.conf`配置是一个大配置文件，可参考EPEL等发行版本默认配置，将`server`段落配置分离到子目录`conf.d`中方便管理：**

在`/opt/openresty/nginx/conf`目录下创建子目录`conf.d`

    cd /opt/openresty/nginx/conf
    mkdir conf.d

修改`/opt/openresty/nginx/conf/nginx.conf`将`http {...}`段落中的`server{...}`复制出来，单独作为`conf.d`子目录下的独立配置文件`default.conf`，并修改其中的以下两行配置项以符合自己环境需要

    server_name
    root

大致的配置如下：

    server {
        listen       80;
        server_name  _;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   /opt/docs;
            index  index.html index.htm;
        }
        ...
    }

然后修改`/opt/openresty/nginx/conf/nginx.conf`,将原先`server{...}`部分替换成如下一行配置

    include conf.d/*.conf;

最后启动服务进行验证  
