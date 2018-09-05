Palm WebOS提供了一个`Mobile Hotspot`小程序，可以将手机作为WiFi热点，提供多台电脑无线连接。不过，默认没有提供共享Inetnet功能，即使手机连接了3G网络，电脑也无法上网。

实际上，WebOS就是一个Linux操作系统，可以通过设置iptables masquerade方式提供共享上网。即，通过ssh登陆到WebOS操作系统，然后执行简单的脚本`sharegprs.sh`（自己写一个）:

```bash
iptables -t nat -A POSTROUTING -s 10.1.1.0/24 ! -d 10.1.1.0/24 -j MASQUERADE
sysctl -w net.ipv4.ip_forward=1
```

执行后就可以共享Palm veer的internet。

[Fix for Mobile Hotspot not Working on Unlocked Veer](https://forums.webosnation.com/hp-veer/301170-fix-mobile-hotspot-not-working-unlocked-veer.html)介绍了一个方法类似：

```bash
echo 1 > /proc/sys/net/ipv4/ip_forward

iptables -t nat -A POSTROUTING -o rmnet0 -j MASQUERADE
iptables -A FORWARD -i iptables -A FORWARD -i eth0 -o eth1 -m state --state RELATED,ESTABLISHED -j ACCEPT -o eth1 -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i rmnet0 -o bridge0 -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i bridge0 -o rmnet0 -j ACCEPT
```

# 参考

* [Fix for Mobile Hotspot not Working on Unlocked Veer](https://forums.webosnation.com/hp-veer/301170-fix-mobile-hotspot-not-working-unlocked-veer.html)