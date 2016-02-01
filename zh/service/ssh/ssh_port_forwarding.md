# ssh端口转发

ssh端口转发提供了强大的天然安全加密通道（tunnel），甚至不需要搭建复杂的VPN，就可以凭借一台ssh服务器作为网管，自由翻墙访问资讯。

在系统维护工作中，ssh也是最为强大的工具，不仅提供了远程服务器的终端访问，而且提供了通过`port forwarding`功能实现文件传输复制、远程桌面访问、以及巧妙的组合成本地编辑远程保存的工作方式。

可以通过端口转发方式实现访问本地`localhost`端口通过ssh服务器转发到ssh服务器后面的内部服务器上，相当于iptables的端口转发，但是更为方便简洁。

	ssh yourserver -L 80:reddit.com:80

此时，你访问本地80端口就会访问到`reddit.com`的`80`端口，这对于一些内网防火墙或堡垒机之后的服务器维护会非常方便。

再举个例子，`gateway`是一台堡垒服务器，连接internet，后面隐藏了服务器`web-1`，我需要维护`web-1`

    ssh gateway -L 2201:web-1:22

这样就可以通过`ssh -p 2201 localhost`直接ssh访问到`web-1`系统。

[TextMate 2使用Tips](/develop/mac/textmate2_tips.md)中介绍了通过`ssh`端口转发方式将远程文件传递到本地桌面由TextMate2编辑并回传保存到服务器，同样使用了类似的配置方法。

> 甚至再复杂一些，可以结合TextMate rmate的远程文件编辑实现跳板机转内部服务器文件编辑？

# 参考

* [SSH: More than secure shell](http://matt.might.net/articles/ssh-hacks/)