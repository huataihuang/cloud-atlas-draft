# 早期macOS(Yosemite)内建FTP服务

早期的Mac OS X实际上内置了FTP服务，只是默认没有启用。如果你的macOS版本是Yosemite(10.10.x)或更早版本，执行以下命令就可以开启FTP服务:

```
sudo -s launchctl load -w /System/Library/LaunchDaemons/ftp.plist
```

关闭命令则相反，将 `load` 改成 `unload`：

```
sudo -s launchctl unload -w /System/Library/LaunchDaemons/ftp.plist
```

> 在任何macOS系统中，启用系统配置中的 `Sharing` 设置的 `Remote Login` ，就可以开启SSH服务，同时也就开启了SFTP服务。

# 新版本macOS安装配置brew提供FTP服务(放弃)

不过，在最新的macOS系统中，已经剔除了FTP服务。如果你依然需要使用，则需要使用 Homebrew 来安装一个名为 `inetutils` 的软件包。这个 `inetutils` 软件包包含了 rsh, rlogin, ftp, telnet 的客户端和服务器端。

```
brew install inetutils
```

注意，安装的客户端都有一个 `g` 开头字母(表示gnu):

```
The following commands have been installed with the prefix 'g'.

    dnsdomainname
    ftp
    rcp
    rexec
    rlogin
    rsh
    telnet
```

这里有个问题，我找不到简单的启动方法。

# 新版本macOS安装配置vsftpd(推荐)

* 安装

```
brew install vsftpd
```

安装完提示：

```
To use chroot, vsftpd requires root privileges, so you will need to run
`sudo vsftpd`.
You should be certain that you trust any software you grant root privileges.

The vsftpd.conf file must be owned by root or vsftpd will refuse to start:
  sudo chown root /usr/local/etc/vsftpd.conf

To have launchd start vsftpd now and restart at startup:
  sudo brew services start vsftpd
Or, if you don't want/need a background service you can just run:
  sudo vsftpd
```

* 设置权限：

```
sudo chown root /usr/local/etc/vsftpd.conf
```

* 修改配置 vsftpd.conf

```
# Uncomment this to allow local users to log in.
local_enable=YES
#
# Uncomment this to enable any form of FTP write command.
write_enable=YES
```

* 在系统中创建一个用户 `ftp` 并设置密码。mac中不能使用命令useradd，所以要到系统偏好设置->用户与群主 中新增用户。

* 启动vsftpd

```
sudo brew services start vsftpd
```

* 使用客户访问

```
ftp localhost
```

## 报错处理

* `500 OOPS: failed to open vsftpd log file:/usr/local/var/log/vsftpd.log`

解决：创建一个空目录 `mkdir /usr/local/var/log/`

* `500 OOPS: vsftpd: not found: directory given in 'secure_chroot_dir':/usr/share/empty`

解决：缺少目录 `/usr/share/empty` ，这个目录默认系统是不允许在 `/usr` 下新建目录，需要关闭 Rootless ，然后创建完成后再恢复。

重启mac，安装 `Command+R` ，进入恢复模式。打开Termianl，执行：

```
csrutil disable
```

然后重启，就可以修改 `/usr` 目录下文件。

注意：在macOS Catalina系统中，目录是只读文件系统，提示错误

```
# mkdir /usr/share/empty
mkdir: /usr/share/empty: Read-only file system
```

参考 ["Macintosh HD" is Read Only - MacOS Catalina 10.15](https://community.adobe.com/t5/lightroom/quot-macintosh-hd-quot-is-read-only-macos-catalina-10-15/td-p/10512630) 执行以下命令重新挂载目录：

```
sudo mount -uw /
```

然后再执行

```
mkdir /usr/share/empty
```

处理完成后，需要恢复默认:

```
csrutil enable
```

* 用户输入正确账号密码登陆，但是报错 `530 Login incorrect.`

解决方法：在 `/etc/pam.d` 目录下添加一个 `ftpd` 配置（早期macOS版本中提供内建FTP支持，就有这个文件）

```
# login: auth account password session
auth       required       pam_opendirectory.so
account    required       pam_permit.so
password   required       pam_deny.so
session    required       pam_permit.so
```

然后重启vsftpd

```
sudo brew services start vsftpd
```

# 参考

* [如何在mac上配置vsftpd](https://blog.csdn.net/u011357712/article/details/73729607) - 非常详尽，vsftpd配置参考这个文档
* [How to Install FTP on MacOS](http://osxdaily.com/2018/08/07/get-install-ftp-mac-os/)
* [How to Run FTP or SFTP Server in macOS?](https://osxtips.net/how-to-run-ftp-sftp-server-in-macos/)
