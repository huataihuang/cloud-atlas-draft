# 硬件和软件要求

在Linux平台上要配置IPMI需要有`/dev/ipmi0`设备存在，如果缺少该设备，`ipmitool`工具就无法工作。此时需要使用如下方法创建设备：

* 如果是SuSE，RedHat或CentOS执行：

```
/etc/init.d/ipmi start
```

> 需要安装`OpenIPMI`工具包

* 在Debian平台执行：

```
modprobe ipmi_devintf
modprobe impi_si
```

# 网络配置

* 首先需要配置IPMI网络，这里需要为第一快网卡配置一个IP地址（网卡主板BMC支持）：

```
ipmitool lan set 1 ipsrc static
ipmitool lan set 1 ipaddr 192.168.1.211
ipmitool lan set 1 netmask 255.255.255.0
ipmitool lan set 1 defgw ipaddr 192.168.1.254
ipmitool lan set 1 defgw macaddr 00:0e:0c:aa:8e:13
ipmitool lan set 1 arp respond on
ipmitool lan set 1 auth ADMIN MD5
ipmitool lan set 1 access on
```

* 检查配置

```
ipmitool lan print 1
```

# 用户配置

* 用户需要具有admin权限

```
ipmitool user set name 2 admin
```

出现报错：

```
Set User Name command failed (user 2, name admin): Invalid data field in request
```

这是因为系统已经设置了一些帐号，已经占用了`2`这个序列号，并且已经设置为名字`admin`

可以通过以下命令检查系统中已经具有的帐号

```
ipmitool user list 1
```

> 这里`1`表示`channel 1`

显示输出

```
ID  Name	     Callin  Link Auth	IPMI Msg   Channel Priv Limit
1                    false   false      true       ADMINISTRATOR
2   admin            false   false      true       ADMINISTRATOR
3   tom              true    true       true       ADMINISTRATOR
4   jerry            true    true       true       ADMINISTRATOR
```

所以我们将命令修改成

```
ipmitool user set name 5 jack
```

此时再次检查`ipmitool user list 1`就会看到

```
ID  Name	     Callin  Link Auth	IPMI Msg   Channel Priv Limit
1                    false   false      true       ADMINISTRATOR
2   admin            false   false      true       ADMINISTRATOR
3   tom              true    true       true       ADMINISTRATOR
4   jerry            true    true       true       ADMINISTRATOR
5   jack             true    false      false      NO ACCESS
```

* 设置新增的`jack`用户的密码

```
ipmitool user set password 5
```

* 设置用户能够远程管理服务器

```
ipmitool channel setaccess 1 5 link=on ipmi=on callin=on privilege=4
```

此时再使用`ipmitool user list 1`可以看到用户`jack`已经具备了完全的帐号

```
ID  Name	     Callin  Link Auth	IPMI Msg   Channel Priv Limit
...
5   jack           true    true       true       ADMINISTRATOR
```

* 激活用户帐号

```
ipmitool user enable 5
```

# 用户配置权限级别

如果用户只允许查询传感器数据，需要设置特定权限。这样的用户没有权限操作服务器，例如，创建一个名为`monitor`的用户。

```
ipmitool user set name 6 monitor
ipmitool user set password 6
ipmitool channel setaccess 1 6 link=on ipmi=on callin=on privilege=2
ipmitool user enable 6
```

然后检查一下用户权限

```
ipmitool channel getaccess 1 6
```

显示输出如下：

```
Maximum User IDs     : 10
Enabled User IDs     : 4

User ID              : 6
User Name            : monitor
Fixed Name           : No
Access Available     : call-in / callback
Link Authentication  : enabled
IPMI Messaging       : enabled
Privilege Level      : USER
```

* 查看访问权限对应的level，使用如下命令

```
ipmitool channel
```

可以看到输出：

```
Possible privilege levels are:
   1   Callback level
   2   User level
   3   Operator level
   4   Administrator level
   5   OEM Proprietary level
  15   No access
```

上述创建的`monitor`用户被赋予`USER`权限。所以网络访问被授予该用户，需要网络访问的MD5授权给这个用户组（USER privilege level）:

```
ipmitool lan set 1 auth USER MD5
```

列出通道用户：

```
ipmitool lan print 1
```

显示输出类似如下：

```
Set in Progress         : Set Complete
Auth Type Support       : NONE MD5 PASSWORD 
Auth Type Enable        : Callback : 
                        : User     : MD5 
                        : Operator : 
                        : Admin    : MD5 
                        : OEM      : 
IP Address Source       : Static Address
IP Address              : 192.168.1.211
Subnet Mask             : 255.255.255.0
MAC Address             : 00:0e:0c:ea:92:a2
SNMP Community String   : 
IP Header               : TTL=0x40 Flags=0x40 Precedence=0x00 TOS=0x10
BMC ARP Control         : ARP Responses Enabled, Gratuitous ARP Disabled
Gratituous ARP Intrvl   : 2.0 seconds
Default Gateway IP      : 192.168.1.254
Default Gateway MAC     : 00:0e:0c:aa:8e:13
Backup Gateway IP       : 0.0.0.0
Backup Gateway MAC      : 00:00:00:00:00:00
RMCP+ Cipher Suites     : 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14
Cipher Suite Priv Max   : XXXXXXXXXXXXXXX
                        :     X=Cipher Suite Unused
                        :     c=CALLBACK
                        :     u=USER
                        :     o=OPERATOR
                        :     a=ADMIN
                        :     O=OEM
```

完成了基本配置以后，就可以参考[ipmitool使用tips](ipmitool_tips)进行远程服务器管理。

# 参考

* [Configuring IPMI under Linux using ipmitool](https://www.thomas-krenn.com/en/wiki/Configuring_IPMI_under_Linux_using_ipmitool)