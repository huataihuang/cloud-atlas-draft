[YAAW](https://github.com/binux/yaaw)是[aria2](https://aria2.github.io/)的WEB前端，无需运行HTTP服务或者后端服务器程序，只需要使用一个浏览器。

* 以RPC方式运行`aria2`

```
aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all
```

> 此时访问`JSON-RPC`路径类似`http://hostname:port/jsonrpc`

如果`aria2`是版本1.18.4或者更高，建议设置 `--rpc-secret=<secret>` ，这样就可以使用 `http://token:secret@hostname:port/jsonrpc` 访问。

如果使用 `aria2` 1.5.2或者更高，则可以使用 `--rpc-user=<username> --rpc-passwd=<passwd>`，这样访问路径就是 `http://username:passwd@hostname:port/jsonrpc`

* 打开浏览器，访问`index.html`，可以通过复制url链接来下载文件，对于一些需要网站登陆才能下载的文件，例如，百度网盘，也可以很好支持：

![结合yaaw前端使用aria2](../../img/service/aria2/aria2_with_yaaw.png)

* 如果出现`Internal server error` 则修改 `JSON-RPC Path`

# 参考

* [YAAW README.md](https://github.com/binux/yaaw)