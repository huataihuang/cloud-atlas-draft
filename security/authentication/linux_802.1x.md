# 连接802.1x

配置`/etc/wpa_supplicant/wpa_supplicant.conf`

```bash
ctrl_interface=/var/run/wpa_supplicant  
ctrl_interface_group=root  
ap_scan=0  
network={  
   key_mgmt=IEEE8021X  
   eap=PEAP  
   phase1="peaplabel=0"  
   phase2="auth=MSCHAPV2"  
   identity="USERNAME"  
   password="PASSWORD"  
}
``` 

* 脚本启动认证和dhcp - `startnet.sh`

```bash
#!/bin/bash  
  
ifconfig eth0 up  
ifconfig eth0 promisc  
wpa_supplicant -i eth0 -B -Dwired -c /etc/wpa_supplicant/wpa_supplicant.conf  
sleep 1 
dhcpd eth0
``` 

> FreeBSD上使用上述方法同样可行（注意网卡名称变化）

## 对于不使用802.1x的无线网络

`/etc/wpa_supplicant/wpa_supplicant.conf`

```bash
network={  
ssid="Your-AP-SSID"  
key_mgmt=WPA-PSK  
psk="your-password"  
priority=5  
} 
``` 

# 参考

* [IEEE 802.1X](https://en.wikipedia.org/wiki/IEEE_802.1X)