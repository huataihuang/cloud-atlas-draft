我在使用Ubuntu for Raspberry Pi 2020.4.1时候，采用服务器版本，所以默认的网络配置是采用netplan。netplan可以使用NetworkManager作为后端，也可以使用systemd-networkd作为后端。为了减少服务组件，我采用 netplan 调用默认的 systemd-networkd 来配置无线网络。

我有2个树莓派，安装操作系统一致，并且采用了相同的 netplan 配置，即在 `/etc/netplan` 目录下创建2个配置文件：

- `01-netcfg.yaml`

```
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      optional: true
      dhcp4: no
      dhcp6: no
      addresses: [192.168.6.15/24, ]
      gateway4: 192.168.6.9
      nameservers:
        addresses: [192.168.6.1,192.168.6.2 ]
```

- `02-wifi.yaml`

```
network:
  version: 2
  renderer: networkd
  wifis:
    wlan0:
      optional: true
      dhcp4: yes
      dhcp6: no
      macaddress: xx:xx:xx:xx:xx:xx
      access-points:
        "SSID-HOME":
          password: "home-passwd"
        "SSID-OFFICE":
          auth:
            key-management: eap
            identity: "office-id"
            password: "office-passwd"
```

执行配置生效:

```
netplan apply
```

没有报错，但是非常奇怪，重启系统之后，只有有线网络IP配置正确，无线网络始终没有激活。

```
# ifconfig wlan0
wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether xx:xx:xx:xx:xx:xx  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

# ip addr
3: wlan0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN group default qlen 1000
    link/ether xx:xx:xx:xx:xx:xx brd ff:ff:ff:ff:ff:ff
```

- 检查 `systemd-networkd` 服务状态::

```
# systemctl status systemd-networkd
● systemd-networkd.service - Network Service
     Loaded: loaded (/lib/systemd/system/systemd-networkd.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2020-11-03 21:47:04 CST; 11h ago
TriggeredBy: ● systemd-networkd.socket
       Docs: man:systemd-networkd.service(8)
   Main PID: 1600 (systemd-network)
     Status: "Processing requests..."
      Tasks: 1 (limit: 9257)
     CGroup: /system.slice/systemd-networkd.service
             └─1600 /lib/systemd/systemd-networkd

Nov 03 21:47:04 pi-worker1 systemd[1]: Starting Network Service...
Nov 03 21:47:04 pi-worker1 systemd-networkd[1600]: Enumeration completed
Nov 03 21:47:04 pi-worker1 systemd-networkd[1600]: wlan0: Link DOWN
Nov 03 21:47:04 pi-worker1 systemd[1]: Started Network Service.
Nov 03 21:47:04 pi-worker1 systemd-networkd[1600]: wlan0: Link UP
Nov 03 21:47:04 pi-worker1 systemd-networkd[1600]: wlan0: IPv6 successfully enabled
Nov 03 21:47:05 pi-worker1 systemd-networkd[1600]: eth0: IPv6 successfully enabled
Nov 03 21:47:05 pi-worker1 systemd-networkd[1600]: eth0: Link UP
Nov 03 21:47:10 pi-worker1 systemd-networkd[1600]: eth0: Gained carrier
Nov 03 21:47:11 pi-worker1 systemd-networkd[1600]: eth0: Gained IPv6LL
```

这里可以看到 eth0 `Gained carrier` 但是 waln0 没有链接成功。

- 检查 `networkctl list` 输出如下::

```
IDX LINK  TYPE     OPERATIONAL SETUP      
  1 lo    loopback carrier     unmanaged  
  2 eth0  ether    routable    configured 
  3 wlan0 wlan     no-carrier  configuring
```

- 检查 `networkctl status -a` 输出如下::

```
● 1: lo                                                         
             Link File: /usr/lib/systemd/network/99-default.link
          Network File: n/a                                     
                  Type: loopback                                
                 State: carrier (unmanaged)        
                   MTU: 65536                                   
  Queue Length (Tx/Rx): 1/1                                     
               Address: 127.0.0.1                               
                        ::1                                     

● 2: eth0                                                                     
             Link File: /usr/lib/systemd/network/99-default.link              
          Network File: /run/systemd/network/10-netplan-eth0.network          
                  Type: ether                                                 
                 State: routable (configured)       
                  Path: platform-fd580000.ethernet                            
                Driver: bcmgenet                                              
            HW Address: dc:a6:32:c5:48:9c (Raspberry Pi Trading Ltd)          
                   MTU: 1500 (min: 68, max: 1500)                             
  Queue Length (Tx/Rx): 5/5                                                   
      Auto negotiation: yes                                                   
                 Speed: 1Gbps                                                 
                Duplex: full                                                  
                  Port: mii                                                   
               Address: 192.168.6.15                                          
                        fe80::dea6:32ff:fec5:489c                             
               Gateway: 192.168.6.9 (Wistron Infocomm (Zhongshan) Corporation)
                   DNS: 30.11.17.1                                            
                        30.17.16.1                                            
                        30.17.16.2                                            

Nov 03 21:47:05 pi-worker1 systemd-networkd[1600]: eth0: IPv6 successfully enabled
Nov 03 21:47:05 pi-worker1 systemd-networkd[1600]: eth0: Link UP
Nov 03 21:47:10 pi-worker1 systemd-networkd[1600]: eth0: Gained carrier
Nov 03 21:47:11 pi-worker1 systemd-networkd[1600]: eth0: Gained IPv6LL

● 3: wlan0                                                                        
             Link File: /run/systemd/network/10-netplan-wlan0.link                
          Network File: /run/systemd/network/10-netplan-wlan0.network             
                  Type: wlan                                                      
                 State: no-carrier (configuring)               
                  Path: platform-fe300000.mmcnr                                   
                Driver: brcmfmac                                                  
            HW Address: xx:xx:xx:xx:xx:xx (LG Electronics (Mobile Communications))
  HW Permanent Address: dc:a6:32:c5:48:9d (Raspberry Pi Trading Ltd)              
                   MTU: 1500 (min: 68, max: 1500)                                 
  Queue Length (Tx/Rx): 1/1                                                       

Nov 03 21:47:04 pi-worker1 systemd-networkd[1600]: wlan0: Link DOWN
Nov 03 21:47:04 pi-worker1 systemd-networkd[1600]: wlan0: Link UP
Nov 03 21:47:04 pi-worker1 systemd-networkd[1600]: wlan0: IPv6 successfully enabled
```

可以看到 `wlan0` 接口状态不正确： `State: no-carrier (configuring)`

为何这个无线网卡始终处于配置状态呢？

# debug

要排查  systemd-networkd 问题，可以开启日志debug模式，添加一个  `/etc/systemd/system/systemd-networkd.service.d/override.conf` 内容如下::

```
[Service]
Environment=SYSTEMD_LOG_LEVEL=debug
```

 然后执行journalctl 的 ``-u`` 参数指定服务单元，并加上 ``-f`` 进行tail::
 
```
journalctl -u systemd-networkd.service -f
```

然后执行一次 ``netplan apply`` 就可以查看日志:

```
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: Bus bus-api-network: changing state UNSET → OPENING
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: Bus bus-api-network: changing state OPENING → AUTHENTICATING
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: timestamp of '/etc/systemd/network' changed
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: timestamp of '/run/systemd/network' changed
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: No virtualization found in DMI
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: No virtualization found in CPUID
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: Virtualization XEN not found, /proc/xen does not exist
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: No virtualization found in /proc/device-tree/*
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: UML virtualization not found in /proc/cpuinfo.
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: This platform does not support /proc/sysinfo
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: Found VM virtualization none
Nov 05 11:45:08 pi-worker1 systemd-networkd[5061]: /usr/lib/systemd/network/80-container-host0.network: Conditions in the file do not match the system environment, skipping.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: New device has no master, continuing without
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Flags change: +MULTICAST +BROADCAST
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Link 3 added
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: udev initialized link
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Saved original MTU: 1500
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: New device has no master, continuing without
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Flags change: +UP +LOWER_UP +RUNNING +MULTICAST +BROADCAST
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Link 2 added
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: udev initialized link
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Saved original MTU: 1500
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: New device has no master, continuing without
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Flags change: +LOOPBACK +UP +LOWER_UP +RUNNING
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Link 1 added
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: udev initialized link
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Saved original MTU: 65536
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering foreign address: fe80::dea6:32ff:fec5:489c/64 (valid forever)
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Gained IPv6LL
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering foreign address: ::1/128 (valid forever)
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering foreign address: 192.168.6.15/24 (valid forever)
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering foreign address: 127.0.0.1/8 (valid forever)
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: ff00::/8, src: n/a, gw: n/a, prefsrc: n/a, scope: global, table: local, proto: boot, type: unicast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: fe80::dea6:32ff:fec5:489c/128, src: n/a, gw: n/a, prefsrc: n/a, scope: global, table: local, proto: kernel, type: local
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering route: dst: ::1/128, src: n/a, gw: n/a, prefsrc: n/a, scope: global, table: local, proto: kernel, type: local
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: fe80::/64, src: n/a, gw: n/a, prefsrc: n/a, scope: global, table: main, proto: kernel, type: unicast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering route: dst: ::1/128, src: n/a, gw: n/a, prefsrc: n/a, scope: global, table: main, proto: kernel, type: unicast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: 192.168.6.255/32, src: n/a, gw: n/a, prefsrc: 192.168.6.15, scope: link, table: local, proto: kernel, type: broadcast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: 192.168.6.15/32, src: n/a, gw: n/a, prefsrc: 192.168.6.15, scope: host, table: local, proto: kernel, type: local
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: 192.168.6.0/32, src: n/a, gw: n/a, prefsrc: 192.168.6.15, scope: link, table: local, proto: kernel, type: broadcast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering route: dst: 127.255.255.255/32, src: n/a, gw: n/a, prefsrc: 127.0.0.1, scope: link, table: local, proto: kernel, type: broadcast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering route: dst: 127.0.0.1/32, src: n/a, gw: n/a, prefsrc: 127.0.0.1, scope: host, table: local, proto: kernel, type: local
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering route: dst: 127.0.0.0/8, src: n/a, gw: n/a, prefsrc: 127.0.0.1, scope: host, table: local, proto: kernel, type: local
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Remembering route: dst: 127.0.0.0/32, src: n/a, gw: n/a, prefsrc: 127.0.0.1, scope: link, table: local, proto: kernel, type: broadcast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: 192.168.6.0/24, src: n/a, gw: n/a, prefsrc: 192.168.6.15, scope: link, table: main, proto: kernel, type: unicast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering route: dst: n/a, src: n/a, gw: 192.168.6.9, prefsrc: n/a, scope: global, table: main, proto: static, type: unicast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received rule message with invalid family 129, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: rtnl: received rule message with invalid family 128, ignoring.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Enumeration completed
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Bus bus-api-network: changing state AUTHENTICATING → HELLO
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=method_call sender=n/a destination=org.freedesktop.DBus path=/org/freedesktop/DBus interface=org.freedesktop.DBus member=Hello cookie=1 reply_cookie=0 signature=n/a error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=method_call sender=n/a destination=org.freedesktop.DBus path=/org/freedesktop/DBus interface=org.freedesktop.DBus member=RequestName cookie=2 reply_cookie=0 signature=su error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=method_call sender=n/a destination=org.freedesktop.DBus path=/org/freedesktop/DBus interface=org.freedesktop.DBus member=AddMatch cookie=3 reply_cookie=0 signature=s error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_33 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=4 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_32 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=5 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_31 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=6 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_32 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=7 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_32 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=8 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=9 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Flags change: +UP
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_33 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=10 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Link UP
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Got message type=method_return sender=org.freedesktop.DBus destination=:1.32 path=n/a interface=n/a member=n/a cookie=1 reply_cookie=1 signature=s error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Bus bus-api-network: changing state HELLO → RUNNING
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Got message type=signal sender=org.freedesktop.DBus.Local destination=n/a path=/org/freedesktop/DBus/Local interface=org.freedesktop.DBus.Local member=Connected cookie=4294967295 reply_cookie=0 signature=n/a error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Got message type=signal sender=org.freedesktop.DBus destination=:1.32 path=/org/freedesktop/DBus interface=org.freedesktop.DBus member=NameAcquired cookie=2 reply_cookie=0 signature=s error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Got message type=signal sender=org.freedesktop.DBus destination=:1.32 path=/org/freedesktop/DBus interface=org.freedesktop.DBus member=NameAcquired cookie=3 reply_cookie=0 signature=s error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Got message type=method_return sender=org.freedesktop.DBus destination=:1.32 path=n/a interface=n/a member=n/a cookie=4 reply_cookie=2 signature=u error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Successfully acquired requested service name.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Got message type=method_return sender=org.freedesktop.DBus destination=:1.32 path=n/a interface=n/a member=n/a cookie=5 reply_cookie=3 signature=n/a error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Match type='signal',sender='org.freedesktop.login1',path='/org/freedesktop/login1',interface='org.freedesktop.login1.Manager',member='PrepareForSleep' successfully installed.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Flags change: -UP
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_33 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=11 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Link DOWN
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Link state is up-to-date
Nov 05 11:45:09 pi-worker1 systemd[1]: Started Network Service.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: found matching network '/run/systemd/network/10-netplan-wlan0.network'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/wlan0/disable_ipv6' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: IPv6 successfully enabled
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/wlan0/proxy_ndp' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/wlan0/use_tempaddr' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/wlan0/accept_ra' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Setting address genmode for link
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Link state is up-to-date
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: found matching network '/run/systemd/network/10-netplan-eth0.network'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/eth0/disable_ipv6' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: IPv6 successfully enabled
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/eth0/proxy_ndp' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/eth0/use_tempaddr' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Setting '/proc/sys/net/ipv6/conf/eth0/accept_ra' to '0'
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: LLDP: Started LLDP client
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Started LLDP.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Setting address genmode for link
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: Link state is up-to-date
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: lo: State changed: pending -> unmanaged
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_31 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=12 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Setting address genmode done.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: State changed: pending -> configuring
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_33 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=13 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Bringing link up
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Flags change: +UP
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_33 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=14 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Link UP
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: LLDP: Started LLDP client
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: wlan0: Started LLDP.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Setting address genmode done.
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Discovering IPv6 routers
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: NDISC: Started IPv6 Router Solicitation client
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: State changed: pending -> configuring
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_32 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=15 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Setting addresses
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Remembering updated address: 192.168.6.15/24 (valid forever)
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Addresses set
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Configuring route: dst: n/a, src: n/a, gw: 192.168.6.9, prefsrc: n/a, scope: global, table: main, proto: static, type: unicast
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Setting routes
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: Routes set
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: eth0: State changed: configuring -> configured
Nov 05 11:45:09 pi-worker1 systemd-networkd[5061]: Sent message type=signal sender=n/a destination=n/a path=/org/freedesktop/network1/link/_32 interface=org.freedesktop.DBus.Properties member=PropertiesChanged cookie=16 reply_cookie=0 signature=sa{sv}as error-name=n/a error-message=n/a
Nov 05 11:45:10 pi-worker1 systemd-networkd[5061]: NDISC: Sent Router Solicitation, next solicitation in 4s
Nov 05 11:45:14 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:14 pi-worker1 systemd-networkd[5061]: rtnl: received non-static neighbor, ignoring.
Nov 05 11:45:14 pi-worker1 systemd-networkd[5061]: NDISC: Sent Router Solicitation, next solicitation in 8s
Nov 05 11:45:21 pi-worker1 systemd-networkd[5061]: NDISC: No RA received before link confirmation timeout
Nov 05 11:45:21 pi-worker1 systemd-networkd[5061]: NDISC: Invoking callback for 'timeout' event.
Nov 05 11:45:23 pi-worker1 systemd-networkd[5061]: NDISC: Sent Router Solicitation, next solicitation in 17s
Nov 05 11:45:40 pi-worker1 systemd-networkd[5061]: NDISC: Sent Router Solicitation, next solicitation in 34s
```

上述日志中有

```
Nov 05 11:45:21 pi-worker1 systemd-networkd[5061]: NDISC: No RA received before link confirmation timeout
Nov 05 11:45:21 pi-worker1 systemd-networkd[5061]: NDISC: Invoking callback for 'timeout' event.
```

[eth network stuck at routable (configuring)#8686](https://github.com/systemd/systemd/issues/8686) 提到了通过禁止DHCPv6但是设置 `IPv6AcceptRA=true` 来解决这个报错。看起来在办公网络DHCP并没有提供RA，参考 [Networkd DHCPv6 client do not start if no RA #13770](https://github.com/systemd/systemd/issues/13770)

参考 [netplan reference](https://netplan.io/reference/)提到 `accept-ra (bool)` 意思是接受路由器公告(Accept Router Advertisement)是内核配置IPv6。当激活是接受路由器公告，禁用是就不响应路由器公告。

不过，我加了这个配置无效

```
accept-ra: yes
```

我发现系统日志中有

```
[Thu Nov  5 11:45:10 2020] brcmfmac: brcmf_cfg80211_set_power_mgmt: power save enabled
[Thu Nov  5 14:55:12 2020] brcmfmac: brcmf_cfg80211_set_power_mgmt: power save enabled
[Thu Nov  5 15:30:03 2020] brcmfmac: brcmf_cfg80211_set_power_mgmt: power save enabled
```

我使用 `iwconfig` 检查可以看到

```
wlan0     IEEE 802.11  ESSID:off/any  
          Mode:Managed  Access Point: Not-Associated   Tx-Power=31 dBm   
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:on
```

不过，使用iwlist尝试扫描:

```
iwlist wlan0 scan
```

提示错误

```
wlan0     Interface doesn't support scanning : Device or resource busy
```

这是什么原因，我对比了另一个正常的树莓派，执行上述 `iwlist wlan0 scan` 是完全正常的，可以输出所有扫描到的SSID。我使用了 `rfkill list` 检查，可以看到这个无线网卡并没有被软件或硬件关闭

```
0: phy0: Wireless LAN
	Soft blocked: no
	Hard blocked: no
```

经过尝试，原来是wlan0没有UP导致上述 iwlist scan失败，即使看上去 ifconfig wlan0 显示UP，也可能没有UP起来。所以重新激活一次wlan0

```
ifconfig wlan0 down
ifconfig wlan0 up
```

然后就可以执行 `iwlist wlan0 scan` 命令了。

我后来发现，还是要检查网络连接认证，通过命令

```
systemctl status netplan-wpa-wlan0.service
```

检查发现是认证错误

```
● netplan-wpa-wlan0.service - WPA supplicant for netplan wlan0
     Loaded: loaded (/run/systemd/system/netplan-wpa-wlan0.service; enabled-runtime; vendor preset: enabled)
     Active: active (running) since Thu 2020-11-05 16:17:34 CST; 2min 7s ago
   Main PID: 1932 (wpa_supplicant)
      Tasks: 1 (limit: 9257)
     CGroup: /system.slice/netplan-wpa-wlan0.service
             └─1932 /sbin/wpa_supplicant -c /run/netplan/wpa-wlan0.conf -iwlan0

Nov 05 16:18:51 pi-worker2 wpa_supplicant[1932]: wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16
Nov 05 16:10:27 pi-worker2 wpa_supplicant[1849]: wlan0: Trying to associate with SSID 'SSID-OFFICE'
Nov 05 16:10:30 pi-worker2 wpa_supplicant[1849]: wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16
Nov 05 16:10:30 pi-worker2 wpa_supplicant[1849]: wlan0: CTRL-EVENT-SSID-TEMP-DISABLED id=0 ssid="SSID-OFFICE" auth_failures=1 duration=23 reason=CONN_FAILED
```

搜索关键字 `wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16` 可以看到

我发现有实际上办公室有多个Access Point使用了相同的SSID，根据 [How can I connect to a specific BSSID?](https://askubuntu.com/questions/833905/how-can-i-connect-to-a-specific-bssid) 是可以指定AP的MAC地址的，也就是设置bssid参数，则在 02-wifi.yaml 添加

```
network:
  version: 2
  renderer: networkd
  wifis:
    wlan0:
      optional: true
      dhcp4: yes
      dhcp6: no
      macaddress: xx:xx:xx:xx:xx:xx
      access-points:
        "SSID-HOME":
          password: "home-passwd"
        "SSID-OFFICE":
          bssid: "xx:xx:xx:xx:xx:xx"
          auth:
            key-management: eap
            identity: "office-id"
            password: "office-passwd"
```

这样生成的wpa配置文件中有了BSSID参数。

> 注意，只有树莓派3B+和4B才支持 5GHz WiFi，所以，如果你使用的是早期产品，例如树莓派Zero W，就无法连接5GHz无线路由器。

[wpa_supplicant: Failed to initiate AP scan](https://forums.gentoo.org/viewtopic-t-993126-start-0.html) 提供了一个非常好的debug方式：

```
wpa_supplicant -B -c /etc/wpa_supplicant/wpa_supplicant.conf -D nl80211 -dd -f /var/log/wpa.log -i wlo1 -t
```

这种方式可以留下详细的debug日志。


# 直接使用wpa_supplicant

我准备直接使用wpa_supplicant来连接，所以使用 netplan 生成的配置 `/run/netplan/wpa-wlan0.conf`

```
ctrl_interface=/run/wpa_supplicant

network={
  ssid="SSID-OFFICE"
  key_mgmt=WPA-EAP
  eap=PEAP
  identity="office-id"
  password="office-passwd"
  phase1="peaplabel=0"
  phase2="auth=MSCHAPV2"
}
network={
  ssid="SSID-HOME"
  key_mgmt=WPA-PSK
  psk="home-passwd"
}
```

我尝试采用 [wpa_supplicant not connecting](https://forums.gentoo.org/viewtopic-t-997890-start-0.html) 的建议方法

```
wpa_supplicant -D wext -c /run/netplan/wpa-wlan0.conf -i wlan0
```

输出显示

```
Successfully initialized wpa_supplicant
ioctl[SIOCSIWENCODEEXT]: Invalid argument
ioctl[SIOCSIWENCODEEXT]: Invalid argument
wlan0: Trying to associate with YY:YY:YY:YY:YY:YY (SSID='SSID-OFFICE' freq=5220 MHz)
Failed to add supported operating classes IE
wlan0: Authentication with YY:YY:YY:YY:YY:YY timed out.
wlan0: CTRL-EVENT-DISCONNECTED bssid=YY:YY:YY:YY:YY:YY reason=3 locally_generated=1
ioctl[SIOCSIWSCAN]: Resource temporarily unavailable
wlan0: CTRL-EVENT-SCAN-FAILED ret=-1 retry=1
wlan0: Trying to associate with XX:XX:XX:XX:XX:XX (SSID='SSID-OFFICE' freq=5320 MHz)
Failed to add supported operating classes IE
wlan0: Authentication with XX:XX:XX:XX:XX:XX timed out.
wlan0: CTRL-EVENT-DISCONNECTED bssid=XX:XX:XX:XX:XX:XX reason=3 locally_generated=1
ioctl[SIOCSIWSCAN]: Resource temporarily unavailable
wlan0: CTRL-EVENT-SCAN-FAILED ret=-1 retry=1
ioctl[SIOCSIWSCAN]: Resource temporarily unavailable
wlan0: CTRL-EVENT-SCAN-FAILED ret=-1 retry=1
```

可以看到实际上wpa_supplicant尝试连接到 `SSID-OFFICE` ，并且会尝试不同的BSSID（也就是无线路由器的不同mac地址）

等等，为何会有 ioctl 参数错误？

```
ioctl[SIOCSIWENCODEEXT]: Invalid argument
```

[Raspberry Pi Wireless Network Setup](http://www.bciuca.com/2014/06/14/raspberrypi-wifi/)提到上述报错是正常的。不过，我参考 [[SOLVED] wpa_supplicant ioctl[SIOCSIWENCODEEXT]](https://bbs.archlinux.org/viewtopic.php?id=244485)，看起来是 `-D` 参数导致的，如果使用 `-D nl80211` 就不再报 `ioctl[SIOCSIWENCODEEXT]: Invalid argument` 错误

```
wpa_supplicant -D nl80211 -c /run/netplan/wpa-wlan0.conf -i wlan0
```

> 后来我查了arch linux资料，原来wpa_supplicant有两种驱动，默认是使用 `nl80211` ，只有这个驱动无法支持的硬件才需要使用已经停止开发的 `wext` 驱动。所以，如果强制指定 `-D wext` 就是会有上述报错，可以忽略。

提示信息

```
Successfully initialized wpa_supplicant
wlan0: Trying to associate with SSID 'SSID-OFFICE'
wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16
wlan0: Trying to associate with SSID 'SSID-OFFICE'
wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16
```

比较奇怪，我连接的bssid怎么都是 `00:00:00:00:00:00` ，但是我按下`ctrl-c`时候输出信息

```
nl80211: deinit ifname=p2p-dev-wlan0 disabled_11b_rates=0
p2p-dev-wlan0: CTRL-EVENT-TERMINATING 
wlan0: CTRL-EVENT-DISCONNECTED bssid=80:a2:35:45:83:28 reason=3 locally_generated=1
nl80211: deinit ifname=wlan0 disabled_11b_rates=0
wlan0: CTRL-EVENT-TERMINATING
```

## 改为纯手工设置 wpa_supplicant

* 移除 `/etc/netplan/02-wifi.yaml` ，然后执行一次 `netplan apply` 可以看到现在 `ifconfig` 已经不再包含无线网卡 `wlan0`

* 检查rfkill是否block了无线网卡

```
rfkill list
```

显示正常

```
0: phy0: Wireless LAN
	Soft blocked: no
	Hard blocked: no
```

* 检查无线网卡 `iwconfig` 输出:

```
wlan0     IEEE 802.11  ESSID:off/any  
          Mode:Managed  Frequency:5.32 GHz  Access Point: Not-Associated   
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:on
          
lo        no wireless extensions.

eth0      no wireless extensions.
```

* 使用 `ifconfig` 命令启用无线网卡

```
sudo ifconfig wlan0 up
```

- 扫描周边无线网络

```
iwlist wlan0 scan | grep ESSID
```


我找到archlinux的wiki文档，指出有些硬件不支持驱动会有类似错误。例如，我前面看到

```
wlan0: Authentication with XX:XX:XX:XX:XX:XX timed out.
```

文档说明：

On some (especially old) hardware, wpa_supplicant may fail with the following error:

```
Successfully initialized wpa_supplicant
nl80211: Driver does not support authentication/association or connect commands
wlan0: Failed to initialize driver interface
```

This indicates that the standard nl80211 driver does not support the given hardware. The deprecated wext driver might still support the device:

(判断错误）我怀疑我复制树莓派firmware文件覆盖ubuntu的firmware来支持USB移动硬盘启动破坏了firmware加载。但是我测试了从正常的树莓派主机上(没有使用USB存储)复制.dat和.elf文件到异常服务器上，重启系统无线依然无法工作。

## 脚本启动

* 配置文件 `/etc/wpa_supplicant/wpa_supplicant-office.conf`:

```bash
ctrl_interface=/var/run/wpa_supplicant
ap_scan=1
network={
  ssid="SSID-OFFICE"
  key_mgmt=WPA-EAP
  eap=PEAP
  phase1="peaplabel=0"
  phase2="auth=MSCHAPV2"
  identity="user_name"
  password="user_password"
}
```

* 执行脚本 `start_wifi`:

```bash
sudo ifconfig wlan0 down
sleep 1
sudo ifconfig wlan0 up
sudo wpa_supplicant -c /etc/wpa_supplicant/wpa_supplicant-office.conf -i wlan0 &
sleep 5
sudo dhcpcd wlan0
```

在异常的树莓派主机上执行上述脚本，显示信息

```
Successfully initialized wpa_supplicant
wlan0: Trying to associate with SSID 'SSID-OFFICE'
wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16
wlan0: Trying to associate with SSID 'SSID-OFFICE'
wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16
wlan0: Trying to associate with SSID 'SSID-OFFICE'
wlan0: CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16
wlan0: Trying to associate with SSID 'SSID-OFFICE'
```

我对比了一台正常的ThinckPad笔记本脚本执行启动脚本，显示信息则

```
Successfully initialized wpa_supplicant
wlp3s0: SME: Trying to authenticate with xx:yy:zz:aa:bb:cc (SSID='SSID-OFFICE' freq=5280 MHz)
wlp3s0: Trying to associate with xx:yy:zz:aa:bb:cc (SSID='SSID-OFFICE' freq=5280 MHz)
wlp3s0: Associated with xx:yy:zz:aa:bb:cc
wlp3s0: CTRL-EVENT-SUBNET-STATUS-UPDATE status=0
wlp3s0: CTRL-EVENT-EAP-STARTED EAP authentication started
wlp3s0: CTRL-EVENT-EAP-PROPOSED-METHOD vendor=0 method=13 -> NAK
wlp3s0: CTRL-EVENT-EAP-PROPOSED-METHOD vendor=0 method=25
wlp3s0: CTRL-EVENT-EAP-METHOD EAP vendor 0 method 25 (PEAP) selected
wlp3s0: CTRL-EVENT-EAP-PEER-CERT depth=1 subject='......' hash=......
wlp3s0: CTRL-EVENT-EAP-PEER-CERT depth=0 subject='......' hash=......
wlp3s0: CTRL-EVENT-EAP-PEER-ALT depth=0 EMAIL:XXXXX Radius
EAP-MSCHAPV2: Authentication succeeded
EAP-TLV: TLV Result - Success - EAP-TLV/Phase2 Completed
wlp3s0: CTRL-EVENT-EAP-SUCCESS EAP authentication completed successfully
wlp3s0: PMKSA-CACHE-ADDED xx:yy:zz:aa:bb:cc 0
wlp3s0: WPA: Key negotiation completed with xx:yy:zz:aa:bb:cc [PTK=CCMP GTK=CCMP]
wlp3s0: CTRL-EVENT-CONNECTED - Connection to xx:yy:zz:aa:bb:cc completed [id=0 id_str=]
```

这里我观察到出现比较奇怪的是，树莓派运行的wpa_supplicant尝试连接到 `'SSID-OFFICE'` 现实的 bssid 是 `00:00:00:00:00:00` ，这明显不是正常的无线AP的MAC地址，正常应该连接的是 `xx:yy:zz:aa:bb:cc`

在 [RPI4 cannot connect to WIFI - status_code=16](https://www.raspberrypi.org/forums/viewtopic.php?t=274715) 找到了相同的案例，提示信息是：

> have found the root cause -- and surprisingly it's wifi-HDMI interference of RPI4.
> 
> Though I have known about this issue, I believed it's not my case, because:
> - I was able to connect to another wifi (mobile hotspot)
> - my resolution was only 1920x1080
> 
> When I lowered screen resolution to 1600x1200, wifi started to work with both of my networks.

在 [CTRL-EVENT-ASSOC-REJECT bssid=00:00:00:00:00:00 status_code=16](https://www.spinics.net/lists/hostap/msg08413.html) 提到了和我相同的困扰，也是树莓派4，重启后随机会连接不了wifi。

在 [USB3 and 2.4 GHz Wifi #1430](https://github.com/raspberrypi/firmware/issues/1430) 提到了用户发现将任何设备插入到某个USB3接口上，就会导致无线无法连接2.4GHz Wifi网络，但是5.0 GHz无线网络工作正常。

似乎这个问题和USB3的HDMI解析问题有关 ，据说这是一个已知的问题 [USB 3.0* Radio Frequency Interference on 2.4 GHz Devices](https://www.intel.com/content/www/us/en/products/docs/io/universal-serial-bus/usb3-frequency-interference-paper.html)。

> 上述Intel手册需要仔细阅读一下，似乎USB 3.0影响无线接收器的性能(如果靠得很近的话)，我觉得这个问题确实是硬件设计问题，包括前面提到的HDMI解析度，或许就是频率影响

在这个帖子中，GithubUser5462用户说明的问题和我一样，也是在USB 3接口上连接外接移动硬盘(他使用的是My Passport WD 2TB外接HDD，而我使用的是My Passprot WD 1TB外接SSD)。另外在 [Pi4, USB3, and Wireless 2.4Ghz interference](https://www.indilib.org/forum/general/6576-pi4-usb3-and-wireless-2-4ghz-interference.html) 有所讨论。

在树莓派论坛已经讨论了这个问题 [Problems adding a USB 3.0 SSD to PI4](https://www.raspberrypi.org/forums/viewtopic.php?f=36&t=266353&p=1693114#p1693114)

我参考前面有人说的修改HDMI分辨率，参考 [Video options in config.txt](https://www.raspberrypi.org/documentation/configuration/config-txt/video.md) 在 `/boot/firmware/config.txt` 中添加2行：

```
hdmi_group=2
hdmi_mode=51
```

似乎有一个安全模式:

```
hdmi_safe=1
```

安全模式相当于启动时最大的HDMI兼容：

```
hdmi_force_hotplug=1
hdmi_ignore_edid=0xa5000080
config_hdmi_boost=4
hdmi_group=2
hdmi_mode=4
disable_overscan=0
overscan_left=24
overscan_right=24
overscan_top=24
overscan_bottom=24
```

但是我设置了 `hdmi_mode=51` 或者 `hdmi_safe=1` 都没有解决这个问题

## 尝试raspbian

我尝试通过TF卡启动到raspbian系统中，使用同样的启动脚本来启动，发现还是出现相同的报错信息。并且这次我是没有外接USB设备，仅仅使用TF卡。我要不要在raspbian中也使用 `hdmi_safe=1` 呢？

实际测试下来还是失败，看来这个问题和直接外接SSD存储没有关系，但是确实和树莓派系统更新有关。

## 可能找到解决方法了

我在树莓派4上通过Raspberry OS官方系统启动，只使用TF卡不使用外接SSD移动硬盘，排除了USB3.0影响因素，所以导致问题的原因应该是wpa_supplicant配置问题。

由于我发现执行 `sudo wpa_supplicant -c /etc/wpa_supplicant/wpa_supplicant-office.conf -i wlan0` 命令提示信息显示 wpa_suuplicant 尝试连接MAC地址 `bssid=00:00:00:00:00:00` ，这明显是错误的不存在MAC，所以我尝试在 `wpa_supplicant-office.conf` 配置中添加指定 bssid 参数，类似如下

```
...
  ssid="SSID-OFFICE"
  bssid=xx:yy:zz:aa:bb:cc
...
```

但是发现此时报错

```
Successfully initialized wpa_supplicant
wlan0: Failed to initiate sched scan
wlan0: Failed to initiate sched scan
...
```

经过多次对比参数，我发现原来不能同时指定 `ssid=` 和 `bssid=` ，同时设置上述两个参数就会导致无法发起iwlist scan。所以，把上述 `ssid="SSID-OFFICE"` 注释掉就能够正常运行。

另外，还有一个非常奇特的参数必须在`wpa_supplicant.conf`中指定，就是 `country=US` ，这个参数是表明无线使用的国家，因为每个国家的2,4GHz使用了不同的通道 [List_of_WLAN_channels](https://en.wikipedia.org/wiki/List_of_WLAN_channels) (参考 [Raspbian - wpa_supplicant.conf Country meaning](https://raspberrypi.stackexchange.com/questions/93679/raspbian-wpa-supplicant-conf-country-meaning) ) 。有可能你需要根据你的路由器来设置这个参数(或者可以在配置中指定channel?)

我测试了如果不指定这个 `country=US` ，就会导致wpa_supplicant启动时候显示 `wlan0: Failed to initiate sched scan` ，使用了这个参数就能正常发起扫描。看起来，应该是某次升级过 wpa_supplicant 版本导致默认的country失效了，就会去连接 `00:00:00:00:00:00` ，但是如果你强制同时指定 ssid 和 bssid ，也会导致 `wlan0: Failed to initiate sched scan` 。

> [Setup WiFi on a Pi Manually using wpa_supplicant.conf](https://www.raspberrypi-spy.co.uk/2017/04/manually-setting-up-pi-wifi-using-wpa_supplicant-conf/) 提供了country解释：
>
> The Country Code should be set the [ISO/IEC alpha2 code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements) for the country in which you are using your Pi. Common codes include :
>
> * gb (United Kingdom)
> * fr (France)
> * de (Germany)
> * us (United States)
> * se (Sweden)

经过验证，指定 `bssid=` 参数可以正常启动`wpa_supplicant`客户端，然后完成连接认证。存在的问题是，会反复出现EAP认证，显示认证成功，然后又断开重新认证成功。不过，反复多次以后，终于不再断开，也就完成认证，稳定连接，最终就能够完成无线认证并通过dhcpcd获得IP地址。

总之，最终的 `wpa_supplicant-office.conf` 如下:

```bash
ctrl_interface=/var/run/wpa_supplicant
#update_config=1
#ap_scan=1
country=US
network={
#  ssid="alibaba-inc"
  bssid=xx:yy:zz:aa:bb:cc
  key_mgmt=WPA-EAP
  eap=PEAP
  phase1="peaplabel=0"
  phase2="auth=MSCHAPV2"
  identity="user_name"
  password="user_password"
}
```

折腾了好几天，终于能够完成无线连接。

不过，我在设置netplan中没有找到设置 `country` 的参数，例如配置 `02-wifi.yaml` 配置

```yaml
network:
  version: 2
  renderer: networkd
  wifis:
    wlan0:
      optional: true
      dhcp4: yes
      dhcp6: no
      accept-ra: yes
      macaddress: 11:22:33:zz:yy:xx
      access-points:
        "SSID-HOME":
          password: "user_password"
        "":
          bssid: xx:yy:zz:aa:bb:cc
          band: 5GHz
          channel: 149
          auth:
            key-management: eap
            method: peap
            phase2-auth: MSCHAPV2
            identity: "user_name"
            password: "user_password"
```

但是 `netplan apply` 生成的配置 `/run/netplan/wpa-wlan0.conf` 内容并没有country参数

```
ctrl_interface=/run/wpa_supplicant

network={
  ssid=""
  bssid=xx:yy:zz:aa:bb:cc
  key_mgmt=WPA-EAP
  eap=PEAP
  identity="user_name"
  password="user_password"
  phase2="auth=MSCHAPV2"
}
```

`journalctl -u netplan-wpa-wlan0.service` 还是看到如下报错

```
Nov 13 15:56:48 pi-worker2 wpa_supplicant[2520]: Successfully initialized wpa_supplicant
Nov 13 15:57:05 pi-worker2 wpa_supplicant[2520]: wlan0: Failed to initiate sched scan
Nov 13 15:57:12 pi-worker2 wpa_supplicant[2520]: wlan0: Failed to initiate sched scan
...
```

不过，既然已经知道是 country 导致的问题，我进一步搜索找到了 [Help: Unable to connect to 5G Wifi on raspberry pi 4 using ubuntu server 18.04](https://askubuntu.com/questions/1214902/help-unable-to-connect-to-5g-wifi-on-raspberry-pi-4-using-ubuntu-server-18-04) ，关键点就是country code，因为5GHz是一个受控频率，需要根据不同国家进行调整country code，否则无法连接。临时的解决方法就是使用 `wireless-tools` 工具设置:

```
sudo apt update
sudo apt install network-manager wireless-tools
sudo iw reg set CN
```

然后就能够正常连接。

要持久化上述country配置，修改 `/etc/default/crda` 配置，将默认的

```
REGDOMAIN=
```

修改成

```
REGDOMAIN=CN
```

然后重启就可以看到5GHz的WiFi正常工作了。

**OMG** 这真是一个折磨人的故障问题，我估计我断断续续花了一周时间才解决这个问题。

# 参考

- [eth network stuck at routable (configuring) #8686](https://github.com/systemd/systemd/issues/8686)
- [networkctl – Query the Status of Network Links in Linux](https://www.tecmint.com/networkctl-check-linux-network-interface-status/)
- [systemd-networkd](https://wiki.archlinux.org/index.php/systemd-networkd)
