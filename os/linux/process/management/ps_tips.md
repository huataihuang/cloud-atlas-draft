我经常使用的 `ps` 命令使用蚕食 `aux` 可以显示系统所有进程，不过，没有按照进程关系进行排列，有时候并不方便观察

ps还有一个参数 `f` 可以按照进程树状关系列出

```
ps auxf
```

可以看到完整的树状关系

```
root       785  0.0  0.1  22324  2800 ?        Ss   May07   0:02 /usr/lib/systemd/systemd-logind
root       794  0.0  0.2  29816  5364 ?        SLs  May07   0:00 /usr/sbin/wickedd-nanny --systemd --foreground
root       813  0.0  0.0   4744  1692 tty1     Ss+  May07   0:00 /sbin/agetty --noclear tty1 linux
root       885  0.0  0.3 204012  6808 ?        Sl   May07   0:00 /usr/sbin/gdm
root       899  0.0  0.3 285240  7400 ?        Sl   May07   0:00  \_ /usr/lib/gdm/gdm-simple-slave --display-id /org/gnome/DisplayManager/Displays/_0
root       921  0.0  1.6 259912 31776 tty7     Ss+  May07   0:02      \_ /usr/bin/Xorg :0 -background none -verbose -auth /run/gdm/auth-for-gdm-p51Yhq/database -seat seat0 vt7
root      1073  0.0  0.4 244484  8264 ?        Sl   May07   0:00      \_ gdm-session-worker [pam/gdm-launch-environment]
gdm       1083  0.0  0.6 557760 12752 ?        Ssl  May07   0:00          \_ /usr/lib/gnome-session-binary --autostart /usr/share/gdm/greeter/autostart
gdm       1127  0.0  1.7 952932 32896 ?        Sl   May07   0:12              \_ /usr/lib/gnome-settings-daemon-3.0/gnome-settings-daemon
gdm       1249  0.0  9.4 1398440 181736 ?      Sl   May07   2:07              \_ gnome-shell --mode=gdm
root       925  0.0  0.3 280636  6448 ?        Ssl  May07   0:01 /usr/lib/accounts-daemon
polkitd    937  0.0  0.9 521572 18428 ?        Ssl  May07   0:11 /usr/lib/polkit-1/polkitd --no-debug
gdm       1077  0.0  0.2  36844  4736 ?        Ss   May07   0:05 /usr/lib/systemd/systemd --user
gdm       1080  0.0  0.1  88408  2008 ?        S    May07   0:00  \_ (sd-pam)
gdm       1086  0.0  0.0  14172  1848 ?        S    May07   0:00 /usr/bin/dbus-launch --exit-with-session /usr/bin/gnome-session --autostart /usr/share/gdm/greeter/autostart
gdm       1087  0.0  0.1  39704  2644 ?        Ss   May07   0:00 /bin/dbus-daemon --fork --print-pid 5 --print-address 7 --session
gdm       1093  0.0  0.2 335560  5592 ?        Sl   May07   0:00 /usr/lib/at-spi2/at-spi-bus-launcher
gdm       1098  0.0  0.1  39600  3840 ?        S    May07   0:00  \_ /bin/dbus-daemon --config-file=/usr/share/defaults/at-spi2/accessibility.conf --nofork --print-address 3
```

如果要指定输出列，例如要指定cgroup显示，则使用

```
ps axfw -eo -eo pid,user,cgroup,args
```

则显示

```
  PID USER     CGROUP                      COMMAND
    2 root     -                           [kthreadd]
    3 root     -                            \_ [ksoftirqd/0]
    5 root     -                            \_ [kworker/0:0H]
    7 root     -                            \_ [rcu_sched]
    8 root     -                            \_ [rcu_bh]
    9 root     -                            \_ [migration/0]
....
    1 root     11:devices:/init.scope,10:p /usr/lib/systemd/systemd --switched-root --system --deserialize 22
  446 root     11:devices:/system.slice/sy /usr/lib/systemd/systemd-journald
  478 root     11:devices:/system.slice/sy /usr/lib/systemd/systemd-udevd
  718 root     11:devices:/system.slice/rn /usr/sbin/rngd --foreground --fill-watermark=3700
  720 message+ 11:devices:/system.slice/db /bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation
  725 root     11:devices:/system.slice/wi /usr/lib/wicked/bin/wickedd-dhcp4 --systemd --foreground
...
```

# 参考

* [How to create an alias in Linux](https://www.redhat.com/sysadmin/how-create-alias-linux)