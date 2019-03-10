[LightDM](http://www.freedesktop.org/wiki/Software/LightDM/)是Ubuntu 16.04 LTS以及之前版本的display manager。虽然更高版本的Ubuntu采用了GDM替代了LightDM，但是一些Ubuntu flavor发行版依然将LightDM作为默认的display manager。

> 例如，我使用的[Ubuntu Budgie](https://ubuntubudgie.org)默认使用LightDM。

LightDM启动X server，用户会话以及greeter（也就是login screen)。

# 配置

> 注意：最新版本 lightdm (15.10以上) 将配置文件 `[SeatDefaults]` 替换成了 `[Seat:*]`

## 修复更换用户uid导致greeter默认账号变化

最近为了统一两台电脑的相同账号名huatai的不同`uid/gid`，所以修改了一下 Ubuntu Budgie 系统的 huatai 账号的 `uid/gid` 。从原先默认安装的 `1000/1000` 修改成 `501/20` 。修改以后，在字符界面终端登陆完成没有问题，使用正常。

然而，发现在LightDM的图形登陆界面，默认的登陆账号名被改成了Libvirt Qemu。并且奇怪的是LightDM居然不让修改默认登陆名字，导致无法使用原先的账号登陆。

原来Greeter默认是不允许输入username的，不过剋修改配置文件 `/etc/lightdm/lightdm.conf.d/50_budgie-desktop.conf` 添加一行

```
[Seat:*]
...
greeter-show-manual-login=tru
```

这样就可以在登陆界面switch用户账号，也就可以重新以huatai账号登陆了。

# 其他报错

启动日志中有以下错误:

```
2月 24 22:22:34 xcloud lightdm[1289]: PAM unable to dlopen(pam_kwallet.so): /lib/security/pam_kwallet.so: cannot open shared object file: No such file or directory
2月 24 22:22:34 xcloud lightdm[1289]: PAM adding faulty module: pam_kwallet.so
2月 24 22:22:34 xcloud lightdm[1289]: PAM unable to dlopen(pam_kwallet5.so): /lib/security/pam_kwallet5.so: cannot open shared object file: No such file or directory
2月 24 22:22:34 xcloud lightdm[1289]: PAM adding faulty module: pam_kwallet5.so
```

这个参考 [cannot login into locked Ubuntu 14.04 session Unity](https://askubuntu.com/questions/758696/cannot-login-into-locked-ubuntu-14-04-session-unity) 似乎和 libpam-kwallet4 libpam-kwallet5 相关，是KDE环境的依赖包。

# 参考

* [LightDM](https://wiki.ubuntu.com/LightDM)