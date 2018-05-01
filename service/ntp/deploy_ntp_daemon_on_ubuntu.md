NTP是网络同步时间的TCP/IP协议。通常客户端会从服务器请求当前时间，并使用获取到的时间设置本地时钟。

> 注意：从Ubuntu 16.04开始`timedatectl`和`timesyncd`（属于`systemd`的部分）代替了以往常用的`ntpdate`和`ntp`工具。

`timesyncd`不仅默认提供，并且取代了`ntpdate`以及`chrony`（用于取代`ntpd`的服务）的客户端。以前通过启动时使用`ntpdate`命令来矫正时间，现在只需要默认启动的`timesyncd`来完成并保持本地时间同步。

如果安装了`chrony`，则`timedatectl`将让`chrony`来实现时间同步。这样可以确保不会同时运行两个时间同步服务。

`ntpdate`今后将在未来的`timedatectl`（或者`chrony`）中去除，并且默认不再安装。`timesyncd`则用于常规的时钟同步，而`chrony`则处理更为复杂的案例。

如果想要矫正时间，可以使用如下命令：

```
chronyd -q
```

如果只是检查时间，但是不设置时钟，则使用

```
chronyd -Q
```

# 配置`timedatectl`和`timesyncd`

* 使用`timedatectl status`可以检查时钟情况：

```
$ timedatectl status
      Local time: Tue 2018-05-01 21:54:24 CST
  Universal time: Tue 2018-05-01 13:54:24 UTC
        RTC time: Tue 2018-05-01 13:54:24
       Time zone: Asia/Shanghai (CST, +0800)
 Network time on: yes
NTP synchronized: yes
 RTC in local TZ: no
```

* 使用`systemctl status systemd-timesyncd`可以检查时钟同步情况：

```
$ systemctl status systemd-timesyncd
● systemd-timesyncd.service - Network Time Synchronization
   Loaded: loaded (/lib/systemd/system/systemd-timesyncd.service; enabled; vendor preset: enabled)
  Drop-In: /lib/systemd/system/systemd-timesyncd.service.d
           └─disable-with-time-daemon.conf
   Active: active (running) since Mon 2018-04-16 10:33:42 CST; 2 weeks 1 days ago
     Docs: man:systemd-timesyncd.service(8)
 Main PID: 910 (systemd-timesyn)
   Status: "Synchronized to time server 91.189.91.157:123 (ntp.ubuntu.com)."
    Tasks: 2
   Memory: 2.2M
      CPU: 2.710s
   CGroup: /system.slice/systemd-timesyncd.service
           └─910 /lib/systemd/systemd-timesyncd

Apr 29 07:30:24 devstack systemd-timesyncd[910]: Timed out waiting for reply from 91.189.91.157:123 (ntp.ubuntu.com).
Apr 29 07:30:24 devstack systemd-timesyncd[910]: Synchronized to time server 91.189.94.4:123 (ntp.ubuntu.com).
Apr 29 09:14:36 devstack systemd-timesyncd[910]: Timed out waiting for reply from 91.189.94.4:123 (ntp.ubuntu.com).
Apr 29 09:14:46 devstack systemd-timesyncd[910]: Timed out waiting for reply from 91.189.89.198:123 (ntp.ubuntu.com).
Apr 29 09:14:56 devstack systemd-timesyncd[910]: Timed out waiting for reply from 91.189.89.199:123 (ntp.ubuntu.com).
Apr 29 09:49:06 devstack systemd-timesyncd[910]: Synchronized to time server 91.189.89.199:123 (ntp.ubuntu.com).
Apr 29 13:52:01 devstack systemd-timesyncd[910]: Timed out waiting for reply from 91.189.89.199:123 (ntp.ubuntu.com).
Apr 29 13:52:11 devstack systemd-timesyncd[910]: Timed out waiting for reply from 91.189.89.198:123 (ntp.ubuntu.com).
Apr 29 13:52:21 devstack systemd-timesyncd[910]: Timed out waiting for reply from 91.189.94.4:123 (ntp.ubuntu.com).
Apr 29 13:52:22 devstack systemd-timesyncd[910]: Synchronized to time server 91.189.91.157:123 (ntp.ubuntu.com).
```

在`/etc/systemd/timesyncd.conf`设置了`timedatectl`和`timesyncd`获取时钟值的名字服务器，并且详细的配置文件可以在`/etc/systemd/timesyncd.conf.d/`目录下找到。

在`/etc/systemd/timesyncd.conf`中配置了`timedatectl`访问的服务器，这里配置了局域网中自建的`chronyd`之间服务（具体配置见后文）

```
[Time]
NTP=192.168.0.1
```

然后重启`systemd-timesyscd`服务

```
sudo systemctl restart systemd-timesyncd
```

再次检查`systemctl status systemd-timesyncd`，就可以看到和指定NTP服务器同步时间：

```
...
May 01 22:38:36 pi1 systemd[1]: Starting Network Time Synchronization...
May 01 22:38:37 pi1 systemd[1]: Started Network Time Synchronization.
May 01 22:38:37 pi1 systemd-timesyncd[23922]: Synchronized to time server 192.168.0.1:123 (192.168.0.1).
```

# 设置网络时间协议的服务

在Ubuntu平台，有多个软件可以实现网络时间服务，如`chrony`，`ntpd`和`open-ntp`。建议使用`chrony`.

## `chrony(d)`

NTP服务`chronyd`计算系统时钟的drift和offset并持续修正。如果长时间不能连接网络NTP服务器，也可以保证时钟不偏移。该服务只消耗很少的处理能力和内存，在现代服务器硬件环境这个消耗往往可以忽略。

* 安装

```
sudo apt install chrony
```

> `chrony`软件包包含2个执行程序：
> 
> * `chronyd` - 通过NTP协议提供时间同步的服务
> * `chronyc` - 命令行和`chrony`服务交互的接口

* chronyd配置

编辑`/etc/chrony/chrony.conf`添加服务配置行：

```
pool 2.debian.pool.ntp.org offline iburst
allow 192.168.0.0/24
```

> 注意：一定要配置一行`allow 192.168.0.0/24`，否则`chronyd`服务启动后不会监听任何端口

* 启动服务

```
sudo systemctl restart chrony.service
```

* 检查状态

```
chronyc sources
```

## 配置ufw

对于启动了`ufw`防火墙配置的Ubuntu服务器，需要添加端口允许：

```
sudo ufw allow ntp

sudo ufw disable
sudo ufw enable
```

# 参考

* [Time Synchronization](https://help.ubuntu.com/lts/serverguide/NTP.html)
* [How To Set Up Time Synchronization on Ubuntu 16.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-time-synchronization-on-ubuntu-16-04)