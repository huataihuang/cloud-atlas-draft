# Nginx Tip 1: 组织Nginx配置文件

Nginx配置文件位于`/etc/nginx`目录，一种较好的组织方式是采用Debian/Ubuntu Apache风格设置：

```
## Main configuration file ##
/etc/nginx/nginx.conf

## Virtualhost configuration files on ##
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/

## Other config files on (if needed) ##
/etc/nginx/conf.d/
```

虚拟主机文件有2个目录，由于`site-available`目录可以包含任何内容，例如测试配置，以及复制和创建的配置，旧配置等。而`sites-enabled`目录则只包含实际激活的配置，并且只需要从`sites-available`目录建立以恶软链接到`sites-enabled`目录下就可以。

不过，记住要在`nginx.conf`配置文件最后包含以下两行

```
## Load virtual host conf files. ##
include /etc/nginx/sites-enabled/*;

## Load another configs from conf.d/ ##
include /etc/nginx/conf.d/*;
```

# Nginx Tip 2: 设置Nginx `work_processes` 和 `worker_connections`

默认的`worker_processes`和`worker_connections`的设置够用，但是这值可以按照以下公式做一些优化：

`max_clients = worker_processes * worker_connections`

默认的基础配置职能处理大约1000个连接

```
worker_processes  1;
worker_connections  1024;
```

对于繁忙的网站上述配置会导致缓慢响应，因为Nginx被I/O操作锁住了。要避免锁情况发生，可以采用 `每个服务器处理器核心对应一个worker_process`的设置方式，类似：

```
worker_processes [number of processor cores];
```

要检查你的服务器CPU核心数量，可以采用

```
cat /proc/cpuinfo | grep processor | wc -l
```

例如，输出 `24` 则设置Nginx的`worker_processes`如下

```
worker_processes 24;
```

`worker_connections`默认设置值`1024`通常可以满足要求（我感觉可能和应用有关，对于不同的web应用这个数值可以上下调整）。

# Nginx Tip 3: 隐藏Nginx服务器Tokens/版本号

隐藏服务器tokens/版本号通常对于一些过期版本有好处，只需要在 `http/server/location`段落设置：

```
server_tokens off;
```

# Nginx Tip 4: Nginx请求/上传最大Body size（`client_max_body_size`）

如果你希望允许用户通过HTTP上传文件，可能需要增加`post`的限制大小。这个设置是通过`client_max_body_size`在`http/server/location`段落设置。默认是`1Mb`，可以修改为`20Mb`并且增加相应的缓存大小：

```
client_max_body_size 20m;
client_body_buffer_size 128k;
```

如果在看到以下错误就表明`client_max_body_size`设置过小了：`Request Entity Too Large`(413)

# Nginx Tip 5: Nginx静态文件缓存控制（浏览器缓存控制指令）

浏览器缓存对于节约服务器资源和带宽非常重要。在Nginx中设置以下基本配置（logging关闭并且失效头部设置为360天）：

```
location ~* \.(jpg|jpeg|gif|png|css|js|ico|xml)$ {
    access_log      off;
    log_not_found   off;
    expires         360d;
}
```

# Nginx Tip 6: 传递PHP请求给`php-fpm`

这里可以设置默认的`tcp/ip`堆栈或者直接使用Unix socket连接。需要设置PHP-FPM监听在准确的相同`ip:port`或者unix socket（注意：socket的权限）。默认设置是使用`ip:port`（也就是`127.0.0.1:9000`）：

```
# Pass PHP scripts to PHP-FPM
location ~* \.php$ {
    fastcgi_index   index.php;
    fastcgi_pass    127.0.0.1:9000;
    #fastcgi_pass   unix:/var/run/php-fpm/php-fpm.sock;
    include         fastcgi_params;
    fastcgi_param   SCRIPT_FILENAME    $document_root$fastcgi_script_name;
    fastcgi_param   SCRIPT_NAME        $fastcgi_script_name;
}
```

也可以将PHP-FPM和Nginx运行在不同的服务器上。

# Nginx Tip 7: 保护（拒绝）访问Nginx的隐含文件

要注意服务器根目录或者其他公共目录下的隐含文件，也就是以`.`开头的不希望网站用户访问的文件。例如公共目录下包含的版本控制文件和目录，例如`.svn`以及一些IDE属性文件和`.htaccess`文件。使用以下配置拒绝所有隐藏文件等访问并关闭日志

```
location ~ /\. {
    access_log off;
    log_not_found off; 
    deny all;
}
```

# PHP-FPM Tip 1 - `php-fpm`配置文件

通常PHP-FPM配置文件位于`/etc/php-fpm.conf`和`/etc/php-fpm.d`目录下。比较好的方法是将所有pool配置都存放在`/etc/php-fpm.d`目录下。需要在`php-fpm.conf`配置中使用

```
include=/etc/php-fpm.d/*.conf
```

# PHP-FPM Tip 2 - PHP-FPM 全局配置微调

默认`emergency_restart_threshold`，`emergency_restart_interval` 和 `process_control_timeout` 都设置成关闭。不过，建议使用如下配置

```
emergency_restart_threshold 10
emergency_restart_interval 1m
process_control_timeout 10s
```

上述配置表示如果10个PHP-FPM子进程以`SIGSEGV`或者`SIGBUS`信号方式在1分钟内连续退出，则PHP-FPM就会自动重启。这个设置也子进程在从master进程获得reaction信号的等待时间限制为10秒。

# PHP-FPM Tip 3 - PHP-FPM pool配置

PHP-FPM可以针对不同网站使用不同的pool并且非常精确地分配资源，甚至对每个pool使用不同的用户和组身份。以下是针对3个不同站点的PHP-FPM pool的文件结构：

```
/etc/php-fpm.d/site.conf
/etc/php-fpm.d/blog.conf
/etc/php-fpm.d/forums.conf
```

以及每个pool的案例配置

* `/etc/php-fpm.d/site.conf`

```
[site]
listen = 127.0.0.1:9000
user = site
group = site
request_slowlog_timeout = 5s
slowlog = /var/log/php-fpm/slowlog-site.log
listen.allowed_clients = 127.0.0.1
pm = dynamic
pm.max_children = 5
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 4
pm.max_requests = 200
listen.backlog = -1
pm.status_path = /status
request_terminate_timeout = 120s
rlimit_files = 131072
rlimit_core = unlimited
catch_workers_output = yes
env[HOSTNAME] = $HOSTNAME
env[TMP] = /tmp
env[TMPDIR] = /tmp
env[TEMP] = /tmp
```

* `/etc/php-fpm.d/blog.conf`

```
[blog]
listen = 127.0.0.1:9001
user = blog
group = blog
request_slowlog_timeout = 5s
slowlog = /var/log/php-fpm/slowlog-blog.log
listen.allowed_clients = 127.0.0.1
pm = dynamic
pm.max_children = 4
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
pm.max_requests = 200
listen.backlog = -1
pm.status_path = /status
request_terminate_timeout = 120s
rlimit_files = 131072
rlimit_core = unlimited
catch_workers_output = yes
env[HOSTNAME] = $HOSTNAME
env[TMP] = /tmp
env[TMPDIR] = /tmp
env[TEMP] = /tmp
```

* `/etc/php-fpm.d/forums.conf`

```
[forums]
listen = 127.0.0.1:9002
user = forums
group = forums
request_slowlog_timeout = 5s
slowlog = /var/log/php-fpm/slowlog-forums.log
listen.allowed_clients = 127.0.0.1
pm = dynamic
pm.max_children = 10
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 4
pm.max_requests = 400
listen.backlog = -1
pm.status_path = /status
request_terminate_timeout = 120s
rlimit_files = 131072
rlimit_core = unlimited
catch_workers_output = yes
env[HOSTNAME] = $HOSTNAME
env[TMP] = /tmp
env[TMPDIR] = /tmp
env[TEMP] = /tmp
```

# PHP-FPM Tip 4 - PHP-FPM Pool 进程管理器(pm)配置

使用PHP-FPM进程管理等最佳方式是使用动态进程管理，这样PHP-FPM进程就只会在需要的时候启动。这个设置类似Nginx `worker_processes` 和 `worker_connections`设置。每个进程都会消耗内存，所以如果网站非常繁忙并且服务器有充足内存则可以设置较大值，如果用于内存缺乏的VPS则针对每秒少量请求，设置较小的值。

建议先测试服务器能够处理多少PHP-FPM进程：首先启动Nginx和PHP-FPM并加载一些PHP页面，特别是一些大型页面。然后检查每个PHP-FPM进程消耗掉内存量，可以使用`top`或`htop`。假设服务器准备预留220Mb内存运行PHP-FPM，而每个进程大约消耗24Mb内存（一些使用插件的大型内容管理系统的每个页面请求会轻易消耗20-40Mb），则简单的计算`max_children`值就是：`220/24 = 9.17`。

此时`pm.max_children`建议设置为`9`，案例可以参考下面的配置

```
pm.max_children = 9
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 4
pm.max_requests = 200
```

默认的每个进程可以处理的最大请求是没有限制的，不过最好设置一个较低的值，例如`200`以避免一些内存问题。

# 参考

* [Nginx and PHP-FPM Configuration and Optimizing Tips and Tricks](https://www.if-not-true-then-false.com/2011/nginx-and-php-fpm-configuration-and-optimizing-tips-and-tricks/)