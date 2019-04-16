# sslh

一种不同的multiplexing是在相同端口处理多种协议。[sslh](http://www.rutschle.net/tech/sslh.shtml)就是这样处理SSL和SSH。它可以分辨出进入的是哪种协议，并转发到响应的服务。这样就可以在同一个端口同时处理HTTPS和SSH。注意，这个方法并不是实际掩藏SSH，扫描端口监听的工具[scanssh](https://en.wikibooks.org/wiki/OpenSSH/Third_Party_Utilities#scanssh)依然可以发现SSH。但是这个方法可以在防火墙后使用较少的端口来提供多种服务。

* 首先安装web服务器，并且配置它接受HTTPS。确保这个服务只监听在localhost。当然也可以配置它监听在非标准端口，如`2443`。
* 设置SSH服务接受端口22的连接。这个监听端口可以是任意端口，但是22是标准端口。
* 创建一个非特权用户运行`sslh`
* 最后安装和启动sslh服务，监听在端口443，并转发到localhost的HTTPS和SSH

		/usr/local/sbin/sslh-fork -u sslh -p xx.yy.zz.aa:443 --tls 127.0.0.1:2443 --ssh 127.0.0.1:22

其他选项可以使用配置文件而不是运行时传递，可参考`basic.cfg`或`example.cfg`

	user: "sslh";
	listen: ( { host: "xx.yy.zz.aa"; port: "443" } );
	on-timeout: "ssl";
	protocols:
	(
	   { name: "ssh"; host: "localhost"; port: "22"; probe: "builtin"; },
	   { name: "ssl"; host: "localhost"; port: "2443"; probe: "builtin"; }
	);

如果SSH结合了TCP Wrapper，则需要使用`service`选项来描述服务

	{ name: "ssh"; service: "ssh"; host: "localhost"; port: "22"; probe: "builtin"; },

没有使用TCP Wrapper则不需要`service`参数

sslh支持检测HTTP,SSL,SSH,OpenVPN,tinc,XMPP的实现，以及任何可以通过规则表达式检测的协议，都可以识别。典型的使用是允许在443端口提供多个服务!!!

> 例如，同时在443端口提供HTTPS和SSL服务。因为，通常情况下，防火墙不会屏蔽443端口，但是会屏蔽22端口。

# 实践

## 安装nginx/openresty

安装 nginx

	yum install nginx

或者使用 OpenResty （定制的nginx）

> 本案例使用OpenResty，实际配置nginx类似

创建证书

	openssl genrsa -out cert.key 2048
	openssl req -new -x509 -key cert.key -out cert.pem -days 3650

将 `nginx.conf` 配置部分

	server {
	    listen       localhost:443 ssl;
	    server_name  localhost;
		
	    ssl_certificate      cert.pem;
	    ssl_certificate_key  cert.key;
		
	    ssl_session_cache    shared:SSL:1m;
	    ssl_session_timeout  5m;
		
	    ssl_ciphers  HIGH:!aNULL:!MD5;
	    ssl_prefer_server_ciphers  on;
		
	    location / {
	        root   html;
	        index  index.html index.htm;
	    }
	}

启动`nginx`，并检查监听端口

	netstat -an | grep 443

可以看到

	tcp        0      0 127.0.0.1:443           0.0.0.0:*               LISTEN

证明已经启动了 https 服务并监听在 localhost 端口

## 安装sslh

先安装软件包

	yum install  sslh

> 这个安装包位于EPEL，所以需要先安装EPEL软件仓库
>
> EPEL中，这个`sslh`配置已经非常完善，配置文件 `/etc/sslh.cfg`

修改`/etc/sslh.cfg`，只需要修改 `{ host: "SERVER_NAME"; port: "443"; }`，这个`SERVER_NAME`对应的是`/etc/hosts`中服务器外网的IP地址解析

	# This is a basic configuration file that should provide
	# sensible values for "standard" setup.

	verbose: false;
	foreground: true;
	inetd: false;
	numeric: false;
	transparent: false;
	timeout: "2";
	user: "sslh";


	# Change hostname with your external address name.
	listen:
	(
	    { host: "SERVERNAME_NAME"; port: "443"; }
	);

	protocols:
	(
	     { name: "ssh"; service: "ssh"; host: "localhost"; port: "22"; probe: "builtin"; },
	     { name: "openvpn"; host: "localhost"; port: "1194"; probe: "builtin"; },
	     { name: "xmpp"; host: "localhost"; port: "5222"; probe: "builtin"; },
	     { name: "http"; host: "localhost"; port: "80"; probe: "builtin"; },
	     { name: "ssl"; host: "localhost"; port: "443"; probe: "builtin"; },
	     { name: "anyprot"; host: "localhost"; port: "443"; probe: "builtin"; }
	);


**现在我们准备在443端口上启动sslh，提供HTTPS和SSH的协议转发**

	systemctl start sslh

启动后检查一下状态

	#systemctl status sslh
	● sslh.service - SSL/SSH multiplexer
	   Loaded: loaded (/usr/lib/systemd/system/sslh.service; disabled; vendor preset: disabled)
	   Active: active (running) since Sat 2016-02-06 22:45:15 CST; 6s ago
	     Docs: man:sslh(8)
	 Main PID: 10805 (sslh)
	   CGroup: /system.slice/sslh.service
	           ├─10805 /usr/sbin/sslh -F /etc/sslh.cfg
	           └─10807 /usr/sbin/sslh -F /etc/sslh.cfg

	Feb 06 22:45:15 testtfs-1-4 systemd[1]: Started SSL/SSH multiplexer.
	Feb 06 22:45:15 testtfs-1-4 systemd[1]: Starting SSL/SSH multiplexer...
	Feb 06 22:45:15 testtfs-1-4 sslh[10805]: sslh-fork v1.17 started

## 验证

使用如下命令验证

	ssh SERVER_NAME -p 443

验证可以从443端口访问并登陆服务器进行维护

同时使用浏览器访问

* https://SERVER_NAME   这个是加密通道
* http://SERVER_NAME:443  这个是非加密通道

验证了sslh确实在443端口提供了多种服务。

# 参考

* [OpenSSH/Cookbook/Multiplexing](https://en.wikibooks.org/wiki/OpenSSH/Cookbook/Multiplexing)
* [sslh - Applicative protocol multiplexer](http://www.rutschle.net/tech/sslh.shtml)