# npm无法下载软件包（被墙）

在景德镇，很多网站会莫名其妙地消失，导致很多在线安装软件包失败。例如，在使用`npm`安装`phantomjs`时候出现如下报错

```bash
PhantomJS not found on PATH
Downloading https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-macosx.zip
Saving to /var/folders/7y/g54fp5257d12brnrq3zccwth0000gn/T/phantomjs/phantomjs-1.9.8-macosx.zip
Receiving...

Error making request.
Error: connect ECONNREFUSED 131.103.20.167:443
    at Object.exports._errnoException (util.js:856:11)
    at exports._exceptionWithHostPort (util.js:879:20)
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1053:14)
```

检测发现访问 https://bitbucket.org 网络连接被reset。

不过，可以看到其目标是希望将 `phantomjs-1.9.8-macosx.zip` 下载到 `/var/folders/7y/g54fp5257d12brnrq3zccwth0000gn/T/phantomjs` 目录下处理。所以一个取巧的方法，是通过翻墙方式，将`phantomjs-1.9.8-macosx.zip`存放到这个目录下，再执行安装命令就可以完成。

> 另外一种方式是通过[ssh端口转发](service/ssh/ssh_port_forwarding.md)通过socks代理方式自由访问internet。

# 参考

* [Running NPM install behind a socks5 proxy](https://github.com/npm/npm/issues/6204)