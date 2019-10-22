最近一次重启了Arch Linux操作系统，发现无法启动X桌面，检查 :

```
[   456.458] (EE) modeset(0): drmSetMaster failed: Permission denied
[   456.458] (EE) 
Fatal server error:
[   456.458] (EE) AddScreen/ScreenInit failed for driver 0
[   456.458] (EE) 
[   456.458] (EE) 
Please consult the The X.Org Foundation support 
         at http://wiki.x.org
 for help. 
[   456.458] (EE) Please also check the log file at "/home/huatai/.local/share/x
org/Xorg.0.log" for additional information.
[   456.458] (EE) 
[   456.464] (EE) Server terminated with error (1). Closing log file.
```

参考 [X broken as drmSetMaster failed](https://linuxiswonderful.wordpress.com/2018/05/01/x-broken-as-drmsetmaster-failed/) 有一个使用xserver传统包的方式来运行::

```
sudo apt-get install xserver-xorg-legacy
```

然后配置 `/etc/X11/Xwrapper.config` 

```
allowed_users=console
needs_root_rights=yes
```

我发现这样可以使用非root帐号启动X，但是感觉似乎有一些问题，导致系统响应有些慢。`kworker/u16:3+events_unbound` 是不是出现在最高cpu占用，且容易出现D。

