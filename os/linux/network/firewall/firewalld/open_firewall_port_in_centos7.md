在CentOS 7中引入了新的防火墙管理工具`firewalld`，安装方法如下：

```
sudo yum install firewalld
```

激活firewalld

```
sudo systemctl enable firewalld
```

启动firewalld

```
sudo systemctl start firewalld
```

# 操作

* 检查default zone

```
firewall-cmd --get-default-zone
```

显示输出：

```
public
```

* 检查激活的zone

```
firewall-cmd --get-active-zones
```

> 注意：如果还没有配置接口的`zone`，此时会没有任何zone显示激活，这里就没有输出。当执行了将某个interface分配给某个zone，就会有输出。例如，后面演示的命令`sudo firewall-cmd --zone=public --change-interface=eth0`之后，就会显示激活了public zone。

* 检查所有zone

```
sudo firewall-cmd --list-all
```

显示输出：

```
public
  target: default
  icmp-block-inversion: no
  interfaces:
  sources:
  services: ssh dhcpv6-client
  ports:
  protocols:
  masquerade: no
  forward-ports:
  source-ports:
  icmp-blocks:
  rich rules:
```

此时可以看到，默认只有2个服务端口可以访问`ssh dhcpv6-client`

* 例如在dmz区域设置端口允许端口2888

```
firewall-cmd --zone=dmz --add-port=2888/tcp --permanent
```

如果是常用的web端口，可以使用

```
firewall-cmd --zone=public --add-service=http --permanent
```

* 例如在public区域设置允许端口2888

```
firewall-cmd --zone=public --add-port=2888/tcp --permanent
```

**注意** 要使得配置生效需要重新加载配置

```
firewall-cmd --reload
```

> 如果没有使用`firewalld`还是使用iptables的话，命令如下

```
sudo iptables -I INPUT -p tcp --dport 2888 -j ACCEPT
sudo service iptables save
```

## 检查可用zones

* 列出所有zone

```
firewall-cmd --get-zones
```

输出显示

```
block dmz drop external home internal public trusted work
```

检查指定zone可以使用参数`--zone=`:

```
sudo firewall-cmd --zone=home --list-all
```

输出显示：

```
home
  target: default
  icmp-block-inversion: no
  interfaces:
  sources:
  services: ssh mdns samba-client dhcpv6-client
  ports:
  protocols:
  masquerade: no
  forward-ports:
  source-ports:
  icmp-blocks:
  rich rules:
```

## 选择接口使用的zone

**除非你配置了网络接口，否则每个接口都会在firewall启动时放入`default` zone**

* 选择接口的zone

例如，这里将`eth0`接口设置`public`zone:

```
sudo firewall-cmd --zone=public --change-interface=eth0
```

检查zone：

```
firewall-cmd --get-active-zones
```

此时显示输出

```
public
  interfaces: eth0
```

## 设置应用规则

最基本的设置是允许服务访问，例如http服务。

* 检查可以添加的服务名称：

```
firewall-cmd --get-services
```

此时会提供已经内置的服务列表。详细的服务配置可以检查`/usr/lib/firewalld/services`目录下的`.xml`配置文件。

* 添加http服务允许

```
sudo firewall-cmd --zone=public --add-service=http
```

* 检查添加结果

```
sudo firewall-cmd --zone=public --list-services
```

可以看到输出：

```
ssh dhcpv6-client http
```

* 为了能够持久化配置，需要再增加`--permanent`参数：

```
sudo firewall-cmd --zone=public --permanent --add-service=http
```

检查结果：

```
sudo firewall-cmd --zone=public --permanent --list-services
```

* 添加特定端口方法：

```
sudo firewall-cmd --zone=public --add-port=5000/tcp
```

检查

```
sudo firewall-cmd --zone=public --list-ports
```

也可以添加端口范围：

```
sudo firewall-cmd --zone=public --add-port=4990-4999/udp
```

# 定义服务

可以模仿系统默认的服务配置，自己定义服务。首先把系统定义的`ssh`服务配置文件`ssh.xml`复制到`/etc/firewalld/services`目录下：

```
sudo cp /usr/lib/firewalld/services/ssh.xml /etc/firewalld/services/example.xml
```

然后修改这个`example.xml`配置：

```xml
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>Example Service</short>
  <description>This is just an example service.  It probably shouldn't be used on a real system.</description>
  <port protocol="tcp" port="7777"/>
  <port protocol="udp" port="8888"/>
</service>
```

然后重新加载规则

```
sudo firewall-cmd --reload
```

此时使用`firewall-cmd --get-services`就会看到自己定义的`example`服务

# 创建自己的区域zone

也可以自己定制zone，例如自己定义一个对外的web zone，命名为`publicweb`，定义一个对内到DNS zone，命名为`privateDNS`:

```
sudo firewall-cmd --permanent --new-zone=publicweb
sudo firewall-cmd --permanent --new-zone=privateDNS
```

此时检查可用permanent zone

```
sudo firewall-cmd --permanent --get-zones
```

但是要生效还需要reload

```
sudo firewall-cmd --reload
firewall-cmd --get-zones
```

然后给`publicweb`增加服务定义：

```
sudo firewall-cmd --zone=publicweb --add-service=ssh
sudo firewall-cmd --zone=publicweb --add-service=http
sudo firewall-cmd --zone=publicweb --add-service=https
sudo firewall-cmd --zone=publicweb --list-all
```

给`privateDNS`增加定义：

```
sudo firewall-cmd --zone=privateDNS --add-service=dns
sudo firewall-cmd --zone=privateDNS --list-all
```

然后修改接口

```
sudo firewall-cmd --zone=publicweb --change-interface=eth0
sudo firewall-cmd --zone=privateDNS --change-interface=eth1
```

持久化：

```
sudo firewall-cmd --zone=publicweb --permanent --add-service=ssh
sudo firewall-cmd --zone=publicweb --permanent --add-service=http
sudo firewall-cmd --zone=publicweb --permanent --add-service=https
sudo firewall-cmd --zone=privateDNS --permanent --add-service=dns
```

规则生效

```
sudo systemctl restart network
sudo systemctl reload firewalld
```

检查zone

```
firewall-cmd --get-active-zones
```

检查zone的服务

```
sudo firewall-cmd --zone=publicweb --list-services
sudo firewall-cmd --zone=privateDNS --list-services
```

如果你想把这个`publicweb`设置为默认zone

```
sudo firewall-cmd --set-default-zone=publicweb
```

# 加IP白名单

```
firewall-cmd --permanent --zone=public --add-source=192.168.100.0/24
firewall-cmd --permanent --zone=public --add-source=192.168.222.123/32
```

> 注意：服务允许先于IP添加的话，则服务先生效。即，如果先添加了http允许，然后再添加IP白名单，则即使IP不在白名单范围，但还是可以访问web服务。

# 参考

* [centos 7 - open firewall port](http://stackoverflow.com/questions/24729024/centos-7-open-firewall-port)
* [How To Set Up a Firewall Using FirewallD on CentOS 7](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-using-firewalld-on-centos-7)
* [Whitelist source IP addresses in CentOS 7](https://unix.stackexchange.com/questions/159873/whitelist-source-ip-addresses-in-centos-7)