# 配置防火墙的方法

`firewall-config`工具是一个图形界面配置工具，用于配置 `firewalld`：它依次用 iptables工具 与执行数据包筛选的内核中的 Netfilter 通信。

由 `firewalld` 提供的是动态的防火墙服务，而非静态的。因为配置的改变可以随时随地立刻执行，不再需要保存或者执行这些改变。配置不会影响现有的网络连接。

`firewall-cmd`命令行客户端。注意， `firewall-cmd` 命令可以由 `root` 用户运行，也可以由管理员用户——换言之， `wheel` 群体的成员运行。在后一种情况里，命令将通过 `polkit` 进程来授权。 

 `firewalld` 的配置储存在 `/usr/lib/firewalld/` 和 `/etc/firewalld/` 里的各种 XML 文件里，这样保持了这些文件被编辑、写入、备份的极大的灵活性，使之可作为其他安装的备份等等。

其他应用程序可以使用 `D-bus` 和 `firewalld` 通信。 

#  比较 `system-config-firewall` 以及 `iptables` 的 `firewalld`

`firewalld` 和 `iptables service` 之间最本质的不同是

* `iptables service` 在 `/etc/sysconfig/iptables` 中储存配置，而 firewalld 将配置储存在 `/usr/lib/firewalld/` 和 `/etc/firewalld/` 中的各种 XML 文件里。

> 注意：当RHEL安装了`firewalld`之后，就不再使用`/etc/sysconfig/iptables`配置文件。

* `firewalld` 可以在运行时间内，改变设置而不丢失现行连接

[firewall和iptables对比](../../../../img/os/linux/security/firewall/firewall_stack.png)

# 理解zone

基于用户对网络中设备和通讯所给与的信任程度，防火墙可以用来将网络分割成不同的区域。 `NetworkManager` 通知 `firewalld` 一个接口归属某个区域。

在`/etc/firewalld/`的区域设定是一系列可以被快速执行到网络接口的预设定。列表并简要说明如下：

* drop（丢弃）
    任何接收的网络数据包都被丢弃，没有任何回复。仅能有发送出去的网络连接。 
* block（限制）
    任何接收的网络连接都被 IPv4 的 icmp-host-prohibited 信息和 IPv6 的 icmp6-adm-prohibited 信息所拒绝。 
* public（公共）
    在公共区域内使用，不能相信网络内的其他计算机不会对您的计算机造成危害，只能接收经过选取的连接。 
* external（外部）
    特别是为路由器启用了伪装功能的外部网。您不能信任来自网络的其他计算，不能相信它们不会对您的计算机造成危害，只能接收经过选择的连接。 
* dmz（非军事区）
    用于您的非军事区内的电脑，此区域内可公开访问，可以有限地进入您的内部网络，仅仅接收经过选择的连接。 
* work（工作）
    用于工作区。您可以基本相信网络内的其他电脑不会危害您的电脑。仅仅接收经过选择的连接。 
* home（家庭）
    用于家庭网络。您可以基本信任网络内的其他计算机不会危害您的计算机。仅仅接收经过选择的连接。 
* internal（内部）
    用于内部网络。您可以基本上信任网络内的其他计算机不会威胁您的计算机。仅仅接受经过选择的连接。 
* trusted（信任）
    可接受所有的网络连接。 

指定其中一个区域为默认区域是可行的。当接口连接加入了 NetworkManager，它们就被分配为默认区域。安装时，firewalld 里的默认区域被设定为公共区域。 

# 预先定义的服务

一项服务可以是本地和目的地端口的列表，如果服务被允许的话，也可以是一系列自动加载的防火墙辅助模块。预先定义的服务的使用，让客户更容易被允许或者被禁止进入服务。

命令行列出默认的预先定义服务:

```
ls /usr/lib/firewalld/services/
```

> `注意`：不要编辑`/usr/lib/firewalld/services/` ，只有 `/etc/firewalld/services/` 的文件可以被编辑。

> `/usr/lib/firewalld/services/`相当于模板列表，可以从中复制需要开启的服务对应的模板到`/etc/firewalld/services/`，然后进行省改。

```
cp /usr/lib/firewalld/services/[service].xml /etc/firewalld/services/[service].xml
```

# 理解直接接口

`firewalld` 有一个被称为 `direct interface`（直接接口），它可以直接通过 iptables、ip6tables 和 ebtables 的规则。

`firewalld` 保持对所增加项目的追踪，所以它还能查询 `firewalld` 和发现由使用直接端口模式的程序造成的更改。直接端口由增加 `--direct` 选项到 `firewall-cmd` 命令来使用。

直接端口模式适用于服务或者程序，以便在运行时间内增加特定的防火墙规则。这些规则不是永久性的，它们需要在每次通过 `D-BUS` 从 `firewalld` 接到启动、重新启动和重新加载信息后运用。 

# 安装防火墙

在 Red Hat Enterprise Linux 7 中，默认安装 `firewalld` 和图形化用户接口配置工具 `firewall-config`。作为 root 用户运行下列命令可以检查：

```
yum install firewalld firewall-config
```

# 禁用防火墙（不推荐）

```
systemctl disable firewalld
systemctl stop firewalld
```

> 停用了`firewalld`之后，才可以使用`iptables`和`ip6tables`服务替代`firewalld`，即安装`iptables-services`软件包。
>
> 不过，还是建议使用`firewalld`，毕竟技术是在不断演进发展的。
>
> **`以下启用iptables的方法仅供参考`**

```
yum install iptables-services
```

然后以 root 身份运行 iptables 和 ip6tables 命令： 

```
systemctl start iptables
systemctl start ip6tables
systemctl enable iptables
systemctl enable ip6tables
```

# 启用防火墙

* 要启动 firewalld，则以 root 用户身份输入以下命令：

```
systemctl start firewalld
```

* 检查防火墙是否运行

```
systemctl status firewalld
```

* 检查 firewall-cmd 是否可以通过输入以下命令来连接后台程序：

```
firewall-cmd --state
```

# 配置防火墙



# 参考

* [使用防火墙](https://access.redhat.com/documentation/zh-CN/Red_Hat_Enterprise_Linux/7/html/Security_Guide/sec-Using_Firewalls.html)