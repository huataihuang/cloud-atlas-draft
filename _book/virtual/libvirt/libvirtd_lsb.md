重启`libvirtd`之后检查状态，发现有一个`LSB: daemon for libvirt virtualization API`。什么是`LSB`?

```
$sudo systemctl status libvirtd
● libvirtd.service - LSB: daemon for libvirt virtualization API
   Loaded: loaded (/etc/rc.d/init.d/libvirtd)
   Active: inactive (dead) since Tue 2017-06-27 11:17:08 CST; 44s ago
     Docs: man:systemd-sysv-generator(8)
  Process: 15761 ExecStop=/etc/rc.d/init.d/libvirtd stop (code=exited, status=0/SUCCESS)
 Main PID: 14816 (code=exited, status=0/SUCCESS)

Jun 27 11:16:47 server.example.com systemd[1]: Starting LSB: daemon for libvirt virtualization API...
Jun 27 11:16:47 server.example.com libvirtd[14809]: Starting libvirtd daemon: [  OK  ]
Jun 27 11:16:47 server.example.com systemd[1]: Started LSB: daemon for libvirt virtualization API.
Jun 27 11:17:07 server.example.com systemd[1]: Stopping LSB: daemon for libvirt virtualization API...
Jun 27 11:17:08 server.example.com libvirtd[15761]: Stopping libvirtd daemon... /var/run/libvirtd-0.pid:
Jun 27 11:17:08 server.example.com libvirtd[15761]: [  OK  ]
Jun 27 11:17:08 server.example.com systemd[1]: Stopped LSB: daemon for libvirt virtualization API.
```



# 参考

* [How to LSBize an Init Script](https://wiki.debian.org/LSBInitScripts)
* [How to Write Linux Init Scripts Based on LSB Init Standard](http://www.thegeekstuff.com/2012/03/lsbinit-script/)