从因特网早期发展起来的DNS解析技术，加密和安全性有限。虽然通过DNSSEC方案电子签名进行验证，加强了DNS安全性，能够抵御DNS投毒污染等篡改通讯的手段，但是对于中间网络设备的监听没有抵御能力。此外，DNSSEC需要大量的DNS解析服务商对现有DNS服务器改造，推进缓慢。

DNS over HTTPS是一个进行安全化域名解析方案，通过加密的HTTPS协议进行DNS解析请求，避免原始DNS协议中用户的DNS解析请求被窃听或者修改（例如中间人攻击）来达到保护用户隐私的目的。

DNS over HTTPS利用HTTP协议的GET命令发出经由JSON编码的DNS解析请求。和传统的DNS洗衣不同，这里的HTTP协议受到加密的SSL/TLS协议保护。

不过，由于基于HTTPS，需要多次数据来回传递才能完成协议初始化，所以这种域名解析比原DNS协议耗时明显增加。

2016年4月1日，Google正式启用了DNS over HTTPS域名安全查询服务。



# 参考

* [Mozilla 邀请用户测试 DNS over HTTPS](https://www.solidot.org/story?sid=56697)
* [维基百科：DNS over HTTPS](https://zh.wikipedia.org/wiki/DNS_over_HTTPS)
* [Google正式启用 DNS-Over-HTTPS 域名安全查询服务](http://blog.51cto.com/professor/1760005)