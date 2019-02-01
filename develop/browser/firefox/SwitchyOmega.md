对于墙内用户科学上网利器[Proxy SwitchyOmega](https://addons.mozilla.org/en-US/firefox/addon/switchyomega/)，提供了自动切换代理服务器的功能。这样既能够快速访问国内网站，也能访问"不存在的网站"。

安装设置分两步：

* 设置Proxy代理服务器，例如采用SSH动态转发功能，可以设置回环地址上代理端口的Socks5代理：

![Proxy SwitchyOmega设置代理](../../../img/develop/browser/firefox/switchyomega_1.png)

* 将"不存在的网站"的网址匹配条件设置成使用Proxy，默认则采用Direct访问：

![Proxy SwitchyOmega设置代理](../../../img/develop/browser/firefox/switchyomega_2.png)