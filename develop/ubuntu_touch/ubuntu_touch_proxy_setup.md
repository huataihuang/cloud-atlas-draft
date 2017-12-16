Ubuntu Touch没有提供GUI设置Proxy的方法，参考[Re: Proxy settings, system wide or for browser?](https://lists.launchpad.net/ubuntu-phone/msg12637.html)，当前主要设置Porxy的方法是通过命令行：

```
gsettings set org.gnome.system.proxy use-same-proxy false
gsettings set org.gnome.system.proxy mode "'manual'"
gsettings set org.gnome.system.proxy ignore-hosts "['localhost', '127.0.0.0/8', '192.168.0.0/16', '::1']"
gsettings set org.gnome.system.proxy.ftp host "'192.168.112.1'"
gsettings set org.gnome.system.proxy.ftp port 800
gsettings set org.gnome.system.proxy.socks host "'192.168.112.1'"
gsettings set org.gnome.system.proxy.socks port 800
gsettings set org.gnome.system.proxy.http host "'192.168.112.1'"
gsettings set org.gnome.system.proxy.http port 800
gsettings set org.gnome.system.proxy.http use-authentication false
gsettings set org.gnome.system.proxy.http enabled true
gsettings set org.gnome.system.proxy.https host "'192.168.112.1'"
gsettings set org.gnome.system.proxy.https port 800
```

但是这个设置对于浏览器不能正常工作，要使得浏览器工作，是通过`/etc/environment`设置：

```
http_proxy=http://192.168.112.1:800/
https_proxy=http://192.168.112.1:800/
ftp_proxy=http://192.168.112.1:800/
no_proxy="localhost,127.0.0.1,192.168.0.0/16"
HTTP_PROXY=http://192.168.112.1:800/
HTTPS_PROXY=http://192.168.112.1:800/
FTP_PROXY=http://192.168.112.1:800/
NO_PROXY="localhost,127.0.0.1,192.168.0.0/16"
```

上述设置可结合[部署Shadowsocks服务器](../../security/vpn/shadowsocks/deploy_shadowsocks_server)来实现翻墙。

> 不过，目前在Ubuntu Touch上采用这种方法非常别扭，由于不能动态修改Proxy，所以不如直接采用VPN方式来实现。

# 参考

* [Network proxy settings BQ Aquaris E4.5](https://askubuntu.com/questions/614462/network-proxy-settings-bq-aquaris-e4-5)