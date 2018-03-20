在Ubuntu上安装软件时，如果需要使用代理服务器，可以在`/etc/apt/apt.conf`中设置，添加如下行：

```
Acquire::http::Proxy "http://yourproxyaddress:proxyport";
```

如果代理服务器需要密码和账号登陆，则将

```
"http://yourproxyaddress:proxyport";
```

修改成

```
"http://username:password@yourproxyaddress:proxyport";
```

> 共享上网的HTTP代理可以采用[Polipo:小巧的web代理服务器](../../../../service/proxy/polipo)

# 参考

* [Configure proxy for APT?](https://askubuntu.com/questions/257290/configure-proxy-for-apt)