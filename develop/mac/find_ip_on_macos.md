虽然我们使用macOS可以通过图形界面非常容易查看自己主机的IP地址：

`System Preferences` => `Network` 就可以检查到主机IP地址

但是我们有时候也需要通过终端命令来检查，例如通过ssh登陆macOS，或者需要检查macOS中运行的虚拟机(例如VMware网络)。macOS和Linux有些不同，没有提供 `ip` 命令，但是提供了 `ifconfig` 命令可以用于检查:

```bash
ifconfig | grep inet
```

对于VMware虚拟机，可以看到有2个网络接口

```
vmnet1: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	ether 00:50:56:c0:00:01
	inet 172.16.99.1 netmask 0xffffff00 broadcast 172.16.99.255
vmnet8: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	ether 00:50:56:c0:00:08
	inet 172.16.16.1 netmask 0xffffff00 broadcast 172.16.16.255
```

其中 `vmnet1` 是Host网络，`vmnet8` 是NAT网络。

macOS还提供了一个 `ipconfig getifaddr en0` 这样的命令来直接获取网卡的IP地址，但是我发现这个命令方法对VMware的虚拟网卡无效。

```
➜  ~ ipconfig getifaddr en0
192.168.0.23
```

# 参考

* [Find your IP Address on a Mac](https://osxdaily.com/2010/11/21/find-ip-address-mac/)