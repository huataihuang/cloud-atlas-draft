代理服务器（proxy server）是指介于客户端和实际请求资源服务器之间的中间服务器，客户端连接代理服务器，请求服务，如文件、连接、web页面等，代理服务器评估请求并控制请求发送给目标服务器，并将目标服务器的返回结果传递给客户端。

代理服务器分为：
* 直接传递请求和返回并不修改内容的称为网关或隧道代理（tunneling proxy）
* 转发网关是一个面向internet的代理用于限制资源的范围
* 反向代理是面向内部的代理，作为控制和保护私有网络服务器的代理服务器，通常执行负载均衡，授权和加密或缓存。

# tunneling proxy

请参考 [设置代理服务器和匿名上网](setup_linux_proxy_server_and_surf_anonymously)

# Open proxies

open proxy是转发服务器，匿名open proxy允许用户隐藏IP地址方式访问internet服务。典型的代理Internet代理服务器是[squid](http://www.squid-cache.org)，默认可以作为正向代理服务器。此外squid也可以配置成反向代理，是一个非常稳定的Proxy解决方案。

# 反向代理

反向代理服务器是对于客户端表现为普通服务器，请求被转发给一个或更多服务器处理：
* 加密/SSL加速：当访问加密网站，SSL加密不是由web服务器完成，而是反向代理完成SSL加速，也称为SSL proxy
* 负载均衡：范县给代理可以将负载均分到后端多个服务器，对于反向代理服务器，url可能需要重写
* 内容缓存
* 压缩
* spoon feeding（喂食）：指反向代理负责处理缓慢响应客户端的资源发送，避免拖累应用服务器
* 安全：范县给代理服务器是增加了安全防攻击的附加保护

典型的反向代理服务器有： [varnish](http://varnish-cache.org) 和 [nginx](https://www.nginx.com)

# 参考

* [Proxy server](https://en.wikipedia.org/wiki/Proxy_server)