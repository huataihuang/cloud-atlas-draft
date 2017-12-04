[aria2](https://aria2.github.io/)是一个轻量级多协议&多源（并发）下载命令行工具。它支持 `HTTP/HTTPS`，`FTP`，`SFTP`，`BitTorrent`和`Metalink`多种协议，并且内建了`JSON-RPC`和`XML-RPC`接口，能够实现daemon方式运行提供客户端调用。

虽然aria2是一个下载工具，但是其良好的性能和扩展性，可以在damon模式下运行，结合WEB-UI或者桌面UI，能够对外提供下载服务。所以，为了更好使用这个下载工具，仔细学习和实践，将其作为服务来对待:

# Web UIs

* [YaaW — Yet Another Aria2 Web Frontend in pure HTML/CSS/Javascirpt](https://github.com/binux/yaaw) -- 非常适合个人桌面使用的纯JS客户端，只需使用浏览器即可
* [Webui — Html frontend for aria2](https://github.com/ziahamza/webui-aria2) -- 可以通过RPC方式调用aria2，自身是一个web管理界面，非常易用

# 参考

* [archlinux: Aria2](https://wiki.archlinux.org/index.php/aria2)