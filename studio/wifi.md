X220作为个人开发服务器，最小化安装操作系统，只有字符界面，所以首先要面对的是如何通过字符终端命令设置无线网络。

实践环境有两种无线网络环境：

* WPA认证无线网络
* 802.11X企业认证无线网络

> 参考 [NetworkManager命令行配置](../os/linux/redhat/system_administration/network/networkmanager_nmcli)

# WPA认证无线网络连接

* 新增加一个wifi类型连接，连接到名为`mylink`的AP上

```
nmcli con add con-name mylink ifname wlp3s0 type wifi ssid mylink
```

* 修改`mylink`配置，增加wifi密码管理方式`wpa-psk`

```
nmcli con modify mylink wifi-sec.key-mgmt wpa-psk
```

* 为`mylink`配置添加访问密码：

```
nmcli con modify mylink wifi-sec.psk MYPASSWORD
```

* 指定设备连接

```
nmcli dev connect wlp3s0
```

# 802.1X企业认证无线网络连接

## 设置网卡静态MAC地址

* 配置 `/etc/NetworkManager/NetworkManager.conf` 添加

```
[device]
wifi.mac-address-randomization=1
```

> 这里值`1`表示`never`；`2`表示`always`。`0`表示`default`

* 编辑 `/etc/sysconfig/network-scripts/ifcfg-mylink`

添加如下配置

```
MACADDR=12:34:56:78:90:ab
```

重启主机，就可以看到每次无线网卡的MAC地址都是指定设置的 `12:34:56:78:90:ab`