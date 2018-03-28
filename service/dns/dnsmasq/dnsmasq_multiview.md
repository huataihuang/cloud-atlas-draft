Bind提供了view方法来实现不同接口不同访问客户端IP地址提供不同等解析结果。类似，在DNSMasq上，也有此类解决方案：

# 配置文件方法

在`/etc/dnsmasq.d/`目录下，按照不同接口，每个接口创建一个配置文件。

例如，有两个无线网卡`wlan0`和`wlan1`，如果要在不同接口上提供不同等dhcp，可以创建两个配置文件如下：

* `/etc/dnsmasq.d/dnsmasq-wlan0.conf`

```
interface=wlan0         # Use interface wlan0
listen-address=10.0.0.1 # Explicitly specify the address to listen on
bind-interfaces         # Bind to the interface to make sure we aren't sending things elsewhere
server=8.8.8.8          # Forward DNS requests to Google DNS
domain-needed           # Don't forward short names
bogus-priv              # Never forward addresses in the non-routed address spaces.
dhcp-range=10.0.0.50,10.0.0.150,12h # Assign IP addresses between 10.0.0.50 and 10.0.0.150 with a 12 hour lease time
```

* `/etc/dnsmasq.d/dnsmasq-wlan1.conf`

```
interface=wlan1         # Use interface wlan0
listen-address=20.0.0.1 # Explicitly specify the address to listen on
bind-interfaces         # Bind to the interface to make sure we aren't sending things elsewhere
server=8.8.8.8          # Forward DNS requests to Google DNS
domain-needed           # Don't forward short names
bogus-priv              # Never forward addresses in the non-routed address spaces.
dhcp-range=20.0.0.50,20.0.0.150,12h # Assign IP addresses between 20.0.0.50 and 20.0.0.150 with a 12 hour lease time
```

# 启动命令方法

可以运行多个`dnsmasq`实例，分别监听不同的接口，区别是启动时候使用不同的`--interface=X`以及`--bind-interfaces`。不过，要注意，`lo`回环地址不能同时绑定2个进程，所以要使用`--except-interface=lo`：

```
dnsmasq --interface=eth0 --except-interface=lo --bind-interfaces --dhcp-range=192.168.0.2,192.168.0.10,12h
dnsmasq --interface=eth1 --except-interface=lo --bind-interfaces --dhcp-range=10.0.0.2,10.0.0.10,12h
```

# 参考

* [dnsmasq, serve different ip addresses based on interface used](https://stackoverflow.com/questions/9326438/dnsmasq-serve-different-ip-addresses-based-on-interface-used)