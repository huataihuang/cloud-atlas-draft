* 修改  `/etc/ocserv/ocserv.conf` :

```
tcp-port = 404
udp-port = 404 
```

* 然后重启

```
systemctl restart ocserv.service
```

提示报错

```
Jun 05 11:11:58 freedom systemd[13845]: ocserv.socket: Failed to create listening socket: Address already in use
Jun 05 11:11:58 freedom systemd[1]: ocserv.socket: Failed to receive listening socket: Input/output error
Jun 05 11:11:58 freedom systemd[1]: ocserv.socket: Failed to listen on sockets: Input/output error
Jun 05 11:11:58 freedom systemd[1]: ocserv.socket: Failed with result 'resources'.
Jun 05 11:11:58 freedom systemd[1]: Failed to listen on OpenConnect SSL VPN server Socket.
```

* 原来还需要修改对应的socket端口，修改 `/lib/systemd/system/ocserv.socket`

```
[Socket]
ListenStream=404
ListenDatagram=404
```

* 重新加载配置

```
systemctl reload-daemon
```

* 重启服务

```
systemctl restart ocserv
```

# 参考

* [How to Set up an OpenConnect VPN Server](https://www.alibabacloud.com/blog/how-to-set-up-an-openconnect-vpn-server_595185)