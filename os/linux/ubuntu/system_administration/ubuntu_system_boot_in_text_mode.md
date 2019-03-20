对于Ubuntu服务器，没有必要启动X Window系统。如果已经安装了Desktop版本，也可以通过切换设置使得系统默认启动就进入字符终端。这种方式也可以节约系统资源。

# 启动时关闭图形splash显示启动信息

* 编辑 `/etc/default/grub`，将以下行:

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
```

修改成

```
RUB_CMDLINE_LINUX_DEFAULT="text"
```

然后更新GRUB

```
sudo update-grub
```

# 现代使用systemd的版本

可以直接使用`systemd`不调用图形登陆界面：

```
sudo systemctl enable multi-user.target --force
sudo systemctl set-default multi-user.target
```

如果提示错误：

```
The unit files have no installation config (WantedBy, RequiredBy, Also, Alias
settings in the [Install] section, and DefaultInstance for template units).
This means they are not meant to be enabled using systemctl.
Possible reasons for having this kind of units are:
1) A unit may be statically enabled by being symlinked from another unit's
   .wants/ or .requires/ directory.
2) A unit's purpose may be to act as a helper for some other unit which has
   a requirement dependency on it.
3) A unit may be started when needed via activation (socket, path, timer,
   D-Bus, udev, scripted systemctl call, ...).
4) In case of template units, the unit is meant to be enabled with some
   instance name specified.
```

* 检查当前默认运行级别：

```
systemctl get-default
```

显示输出表示默认是图形界面

```
graphical.target
```

在 `/lib/systemd/system/` 目录下包含了所有运行级别

```
lrwxrwxrwx 1 root root   15 2月  14 05:32 /lib/systemd/system/runlevel0.target -> poweroff.target
lrwxrwxrwx 1 root root   13 2月  14 05:32 /lib/systemd/system/runlevel1.target -> rescue.target
lrwxrwxrwx 1 root root   17 2月  14 05:32 /lib/systemd/system/runlevel2.target -> multi-user.target
lrwxrwxrwx 1 root root   17 2月  14 05:32 /lib/systemd/system/runlevel3.target -> multi-user.target
lrwxrwxrwx 1 root root   17 2月  14 05:32 /lib/systemd/system/runlevel4.target -> multi-user.target
lrwxrwxrwx 1 root root   16 2月  14 05:32 /lib/systemd/system/runlevel5.target -> graphical.target
lrwxrwxrwx 1 root root   13 2月  14 05:32 /lib/systemd/system/runlevel6.target -> reboot.target
```

传统上默认运行级别包含在 `/etc/inittab` 中，不过，现代操作系统改用systemd来管理运行级别。

可以手工设置默认运行级别：

```
rm /etc/systemd/system/default.target
ln -s /lib/systemd/system/runlevel3.target /etc/systemd/system/default.target
```

此时再检查运行级别可以看到输出修改成 `multi-user.target`

```
# systemctl get-default
multi-user.target
```

要恢复原先的图形界面可以将软链接再改为 `runlevel5.target`

```
rm /etc/systemd/system/default.target
ln -s  /lib/systemd/system/runlevel5.target  /etc/systemd/system/default.target
```

# 参考

* [How do I disable X at boot time so that the system boots in text mode?](https://askubuntu.com/questions/16371/how-do-i-disable-x-at-boot-time-so-that-the-system-boots-in-text-mode)
* [SYSTEMD TARGETS](http://www.landoflinux.com/linux_runlevels_systemd.html) - 非常详尽的指南