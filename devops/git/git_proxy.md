在我们无法直接访问git仓库时，可能需要配置代理服务器。

简单的配置方法是:

```bash
git config --global http.proxy http://proxyUsername:proxyPassword@proxy.server.com:port

# 很多git clone http 会转跳 https ，所以通常可以配置如下
git config --global http.https.proxy http://proxyUsername:proxyPassword@proxy.server.com:port
```

如果只针对部分域名需要代理，则配置

```bash
git config --global http.https://domain.com.proxy http://proxyUsername:proxyPassword@proxy.server.com:port
git config --global http.https://domain.com.sslVerify false
```

上述命令会在 `~/.gitconfig` 配置中添加

```bash
[http]
[http "https://domain.com"]
	proxy = http://proxyUsername:proxyPassword@proxy.server.com:port
```

如果出现SSL验证问题，则可以添加不验证SSL

```bash
git -c http.sslVerify=false clone https://domain.com/path/to/git

git config http.sslVerify false
```

上述命令可以全局配置

```bash
git config --global http.https://domain.com.sslVerify false
```

也就是在 `~/.gitconfig` 配置中加上

```bash
[http]
[http "https://domain.com"]
	proxy = http://proxyUsername:proxyPassword@proxy.server.com:port
	sslVerify = false
```

完成后，可以使用以下命令检查配置(所有http开头配置)

```bash
git config --global --get-regexp http.*
```

如果不再需要代理配置，则使用以下命令清理

```bash
git config --global --unset http.proxy
git config --global --unset http.https://domain.com.proxy

git config --global --unset http.sslVerify
git config --global --unset http.https://domain.com.sslVerify
```

# 参考

* [Configure Git to use a proxy](https://gist.github.com/evantoli/f8c23a37eb3558ab8765)