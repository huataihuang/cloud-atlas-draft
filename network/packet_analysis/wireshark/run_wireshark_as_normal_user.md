在[MacBook Pro上安装Fedora作为工作平台](../../../os/linux/redhat/fedora/multiboot_fedora_and_macOS)，开发HTTP客户端时，需要通过wireshark来分析通讯过程。

默认情况下wireshark需要root权限才能对网卡进行混杂模式嗅探，而平时都是采用普通用户身份来运行桌面，使用`sudo`在终端中切换身份运行总觉得非常麻烦。

# 权限分离运行Wireshark

Wireshark支持[权限分离](https://wiki.wireshark.org/Development/PrivilegeSeparation)模式运行，即Wireshark GUI（或者tshark CLI）运行在普通用户权限，而`dumpcap`包捕捉工具作为root权限运行。这是通过安装`dumpcap setuid root`来实现的。

GNU/Linux发行版通常提供了包管理器来处理安装、 配置和删除软件包。Wireshark通过不同的发行版可以帮助配置dumpcap允许非root用户使用。

> Debian, Ubuntu安装Wireshark包需要参考 `/usr/share/doc/wireshark-common/README.Debian` 设置权限

# 手工设置dumpcap权限

## 如果内核和文件系统支持文件权限(file capabilities)

> 在Fedora 27上没有实现

* 首先确保已经安装了必要的工具，例如`setcap`命令

* 检查dumpcap

```
$ ls -lh /usr/bin/dumpcap
-rwxr-x---. 1 root wireshark 107K Aug  8 19:52 /usr/bin/dumpcap

$ sudo lsattr /usr/bin/dumpcap
--------------e---- /usr/bin/dumpcap
```

* 使用以下命令设置dumcap网络权限

```bash
setcap 'CAP_NET_RAW+eip CAP_NET_ADMIN+eip' /usr/bin/dumpcap
```

> 这里`/usr/bin/dumpcap`需要体换成发行版的`dumpcap`实际安装位置。这里的案例是在Fedora上执行的。

* 以non-root身份启动Wireshark，检查是否可以看到所有网络接口并且可以动态抓包

## 如果内核和文件系统不支持文件权限(file capabilities)

> 如果呢和和文件系统不支持文件权限，就需要确保`dumcap`使用了`set-UID`成root的功能

* 将`dumpcap`的属主设置成`root` - 这步也可以忽略，在CentOS/Fedora中，默认`dumpcap`的属主就是root，即如下

```
$ ls -lh /usr/bin/dumpcap
-rwxr-x---. 1 root wireshark 107K Aug  8 19:52 /usr/bin/dumpcap
```

如果需要，执行以下命令

```bash
chown root /usr/bin/dumpcap
```

* 设置`dumpcap` SUID （设置了`s`之后，执行该程序就自动以程序所有者的身份运行，也就是前面设置的`root`属主身份运行，这样普通用户运行`dumpcap`时候就会以root身份运行。**`警告`**：这是一个安全漏洞，仅可以用在有安全保障的系统中）

```
chmod u+s /usr/bin/dumpcap
```

* 限制`dumcap`只允许一个组用户可以运行（`wireshark`组），其他用户去除执行权限 - 这步在Fedora中可以忽略，系统默认创建了`wireshark`组，并且也限制了其他组用户使用

```
groupadd -g 982 wireshark
chgrp wireshark /usr/bin/dumpcap
chmod o-rx /usr/bin/dumpcap
```

完成后检查`dumpcap`文件权限应该如下：

```
$ ls -lh /usr/bin/dumpcap
-rwsr-x---. 1 root wireshark 107K Aug  8 19:52 /usr/bin/dumpcap
```

* 将需要执行wireshark的用户添加到`wireshark`用户组

> 需要退出当前登陆，重新登陆后验证普通用户身份运行wireshark

# 参考

* [Platform-Specific information about capture privileges](https://wiki.wireshark.org/CaptureSetup/CapturePrivileges)