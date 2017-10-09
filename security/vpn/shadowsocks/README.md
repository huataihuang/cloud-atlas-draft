shadowsocks是基于Socks5代理方式的网络数据加密传输包，分为服务器端和客户端。使用前，先将服务器端部署到服务器，然后通过客户端连接并创建本地代理：

* Shadowsocks使用自行设计的协议进行加密通讯，加密算法有 [AES](https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86), [Blowfish](https://zh.wikipedia.org/wiki/Blowfish_(%E5%AF%86%E7%A0%81%E5%AD%A6))，[IDEA](https://zh.wikipedia.org/wiki/IDEA%E7%AE%97%E6%B3%95)，[RC4](https://zh.wikipedia.org/wiki/RC4)等。除创建TCP连接外无需[握手](https://zh.wikipedia.org/wiki/%E6%8F%A1%E6%89%8B_(%E6%8A%80%E6%9C%AF))，每次请求只转发一个连接，因此使用起来网速较快，在移动设备上也比较省电。
* 所有流量都经过算法加密，允许自行选择算法，所以比较安全。
* Shadowsocks通过异步I/O和事件驱动程序运行，响应速度快。
* 客户端覆盖多个主流操作系统和平台，有python,go,c各种语言版本

**`安全注意`**：

Shadowsocks自行设计的加密协议对双方的身份认证仅限于`预共享密钥`，并无[前向安全性](https://zh.wikipedia.org/wiki/%E5%AE%8C%E5%85%A8%E5%89%8D%E5%90%91%E4%BF%9D%E5%AF%86)（即如果密钥暴露，先前加密的通讯也会被解密，所以安全性降低），并未曾有安全专家公开分析或评估协议及其实现。

**Shadowsocks不能替代TLS或者VPN**，本质上只是设置了密码的网络代理协议，不能用作匿名通信方案。该协议的目标不在于提供完整的通信安全机制，主要是为了协助上网用户突破封锁。所以企业级用途需求的用户应使用VPN。



# 参考

* [维基百科: Shadowsocks](https://zh.wikipedia.org/zh-cn/Shadowsocks)
* [写给非专业人士看的 Shadowsocks 简介](https://vc2tea.com/whats-shadowsocks/)