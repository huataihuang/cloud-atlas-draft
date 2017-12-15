既然已经[在Nexus 5上安装好了buntu Touch系统](install_ubuntu_touch_in_nexus_5)，也解决了[802.1x无线网络连接](802.1x_wireless_network_to_ubuntu_phone)问题，我们现在可以把这台小小的Nexus 5手机作为全功能的Linux移动办公电脑来使用了。

既然是Linux，能够提供ssh登陆服务，方便我们探索整个系统是一个起步。

> 注意：Ubuntu Touch默认设置了ssh通过密钥登陆，这是一个良好的设置。密码登陆存在暴力破解问题，所以建议采用ssh密钥登陆。请不要修改默认安全设置。

# 设置ssh服务

## 通过adb启动sshd服务

* 首先在Ubuntu Touch上启用Developer Mode（需要设置保护密码），这样就可以通过`adb`推送文件以及运行命令

* 使用USB连接电脑和Ubuntu Touch手机

* 电脑上执行以下命令，通过`adb`启用Ubuntu Touch手机中的`sshd`

```
adb shell -x "/etc/init.d/ssh start"
```

如果sshd服务因为没有密钥无法启动，可以先执行`adb shell -x "ssh-keygen -A"`来为系统创建主机ssh密钥

* 检查服务

```
adb shell -x "ps aux | grep ssh"
```

可以看到有一个进程`/usr/sbin/sshd -D -o PasswordAuthentication=no`在运行中。

## 将自己电脑的ssh公钥推送到Ubuntu Touch用户phablet

* `phablet`是Ubuntu Touch上的特殊用户，具有sudo权限，需要将ssh公钥存放到该账户下以便能够访问

* 为`phablet`用户设置好`~/.ssh`目录

```
adb shell -x "mkdir /home/phablet/.ssh;chmod 700 /home/phablet/.ssh;chown phablet:phablet /home/phablet/.ssh"
```

* 推送公钥

```
adb push ~/.ssh/id_rsa.pub /tmp/id_rsa.pub

adb shell -x "mv /tmp/id_rsa.pub /home/phablet/.ssh/authorized_keys;chmod 600 /home/phablet/.ssh/authorized_keys;chown phablet:phablet /home/phablet/.ssh/authorized_keys"
```

* 查看Ubuntu Touch获取的IP地址用于ssh登陆

```
adb shell -x "ifconfig wlan0"
```

> 假设Ubuntu Touch的IP地址是`192.168.1.10`，现在我们可以登陆了

```
ssh phablet@192.168.1.10
```