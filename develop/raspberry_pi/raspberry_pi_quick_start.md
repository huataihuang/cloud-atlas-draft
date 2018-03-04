

从[树莓派官网](https://www.raspberrypi.org/)可以下载

```
sudo dd if=2017-11-29-raspbian-stretch-lite.img of=/dev/sdb bs=4M
```

# 配置树莓派初始环境

为了能够通过网线直接连接笔记本电脑，所以简化设置树莓派采用静态IP地址。

> 我采用笔记本电脑直接连接一条短网线和树莓派通讯，中间不经过交换机。树莓派的电源由笔记本电脑的USB口供电。

* 将树莓派B3的TF卡通过USB转接器连接到笔记本的USB接口，识别成`/dev/sdb`
* 挂载`/dev/sdb2`（Linux分区）到`/mnt`分区，然后就可以修改配置：

```
mount /dev/sdb2 /mnt
```

## 采用chroot方式切换到树莓派环境

为了能够让树莓派第一次启动就进入预设环境（设置静态IP地址，启动ssh服务，设置密码），在前面完成树莓派TF卡文件系统挂载到笔记本（Linux操作系统）之后，采用chroot切换到树莓派环境。这样就可以模拟运行了树莓派操作系统，并且所有修改都会在树莓派环境生效。

> 注意：
>
> 如果你没有使用`chroot`切换到树莓派操作系统环境。则下文中所有编辑配置文件都是在`/mnt`目录下的子目录，例如`/mnt/etc/dhcpcd.conf`配置文件就是树莓派的配置文件`/etc/dhcpcd.conf`；`/mnt/etc/network/interfaces`对应树莓派配置文件`/mnt/etc/network/interfaces`。

```
mount -t proc proc /mnt/proc
mount --rbind /sys /mnt/sys
mount --make-rslave /mnt/sys
mount --rbind /dev /mnt/dev
mount --make-rslave /mnt/dev
```

进入树莓派系统

```
chroot /mnt /bin/bash
source /etc/profile
export PS1="(chroot) $PS1"
```

## 设置有线网卡静态IP

* `/network/interfaces`

这个配置文件是动态配置的，实际配置需要在`dhcpcd.conf`中配置

* 修改 `/etc/dhcpcd.conf`（在这个配置文件的最后部份有静态配置的案例）

```bash
# Example static IP configuration:
interface eth0
static ip_address=192.168.0.10/24
#static ip6_address=fd51:42f8:caae:d92e::ff/64
static routers=192.168.0.1
#static domain_name_servers=192.168.0.1 8.8.8.8 fd51:42f8:caae:d92e::1
static domain_name_servers=202.96.209.133
```

## 设置ssh默认启动

* 激活ssh服务默认启动

```
sudo systemctl enable ssh
```

* 启动ssh服务

```
sudo systemctl start ssh
```

## 设置pi用户帐号密码和root密码

> 注意：默认的树莓派用户帐号是`pi`，密码是`raspberry`，一定要第一时间修改成复杂密码，避免安全漏洞。此外，还要设置root用户密码。

```
sudo su -
passwd pi
passwd
```

以上3个命令是为了切换到超级用户`root`帐号下，然后分别为`pi`用户设置密码，以及为自己（`root`）设置密码。

# 启动

现在可以启动树莓派，很简单，将USB线连接到笔记本电脑上提供电源，另外将网线连接树莓派网口和笔记本网口，笔记本网卡配置`192.168.0.1/24`就可以联通网络。

在笔记本上输入如下命令通过ssh登录树莓派：

```
ssh pi@192.168.0.10
```

# IP masquerade

上述通过网线直接连接树莓派和笔记本电脑虽然非常方便（无需交换机），也便于移动办公。但是此时树莓派尚未连接因特网，对于在线安装和更新软件非常不便。

简单的解决方法是使用iptables的NAT masquerade，即在笔记本（相当于树莓派的网关）输入如下命令（或执行脚本）：

```
sudo iptables -t nat -A POSTROUTING -s 192.168.0.0/24 -o wlp3s0 -j MASQUERADE
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
```

**注意**在使用`firewalld`的时候，不需要执行以上iptables命令，后面有案例在`firewall-cmd`中开启masquerade。

> `-t nat -A POSTROUTING -j MASQUERADE`即可以实现网络地址转换
>
> 第2条指令是开启IP转发

这里遇到一个问题：在NAT之后的树莓派可以ping通外网，但是DNS解析却不能成功，虽然从笔记本电脑上检查`iptables -nat -L`中已经包含如下IP masquerade:

```
MASQUERADE  all  --  192.168.0.0/24       anywhere
```

原因是：Fedora默认开启了firewalld防火墙，只允许ICMP数据包通过，这样笔记本电脑接收到ping包后，可以转发给外网并回传，但是其他TCP和UDP数据包没有放行。

解决方法参考[设置Fedora/CentOS 7作为路由器](https://www.lisenet.com/2016/firewalld-rich-and-direct-rules-setup-rhel-7-server-as-a-router/)

* 首先检查有哪些激活的zone

```
$ sudo firewall-cmd --get-active-zones
public
  interfaces: enp0s20u1 wlp3s0
```

可以看到有线网卡和无线网卡都默认设置为 public，所以默认拒绝外部访问。

* 检查有那些可用的zone

```
$ firewall-cmd --get-zones
FedoraServer FedoraWorkstation block dmz drop external home internal public trusted work
```

* 现在检查`dmz`区域尚无接口

```
$ sudo firewall-cmd --zone=dmz --list-all
dmz
  target: default
  icmp-block-inversion: no
  interfaces: 
  sources: 
  services: ssh
  ports: 
  protocols: 
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules:
```

* 将接口`enp0s20u1`迁移到 DMZ 区

```
$ sudo firewall-cmd --zone=dmz --change-interface=enp0s20u1
The interface is under control of NetworkManager, setting zone to 'dmz'.
success
```

* 再次检查激活区域

```
]$ firewall-cmd --get-active-zones
dmz
  interfaces: enp0s20u1
public
  interfaces: wlp3s0
```

* 添加`dmz`区域允许访问的服务

```
# firewall-cmd --permanent --zone=dmz --add-service={http,https,ldap,ldaps,kerberos,dns,kpasswd,ntp,ftp}
# firewall-cmd --reload
```

这样就使得树莓派能方位外部服务端口（实际上是在笔记本网卡接口上开启了这些服务的端口允许访问）

* 启用端口转发

```
echo "net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/ip_forward.conf 

sudo sysctl -w net.ipv4.ip_forward=1
```

* 通过`firewall-cmd`启用MASQUERADE

```
firewall-cmd --permanent --zone=public --add-masquerade
firewall-cmd --reload
```

接下来，通过硬盘扩展卡，为树莓派添加一个大容量硬盘，[从USB硬盘启动树莓派](boot_from_usb_storage_on_raspberry_pi)构建一个完整的微型服务器。

# 参考

* [How to give your Raspberry Pi a Static IP Address - UPDATE](https://www.modmypi.com/blog/how-to-give-your-raspberry-pi-a-static-ip-address-update)