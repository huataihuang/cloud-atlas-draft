`VNC`支持标准的SSH会话，使用以下方法：

* 使用`virsh`查询远程服务器（192.168.1.1）上的guestVNC图形控制台的端口：

```
virsh -c qemu+ssh://root@192.168.1.1/system vncdisplay guest01
```

此时显示输出是VNC提供的访问接口地址和端口，例如 `127.0.0.1:10`

* 开启一个SSH会话将远程VNC端口转发到本地端口。注意：前面显示的远程KVM guest的VNC端口需要加上`5900`才是连接的端口，例如这里是`5910`。本地端口是随意的，以下将远程服务器上的`5902`VNC端口转发到本地的 `5901` 端口 (这里故意为了展示本地端口和远程端口可以不一样)，命令如下：

```
ssh -L 5910:localhost:5901 root@192.168.1.1
```

* 在本地使用VNC客户端访问本地回环地址的`5901`端口（对`vncviewer`客户端是`:1`）就会由SSH转发端口给远程服务器的VNC控制台

```
vncviewer localhost:1
```

> 参考 [Displaying the remote KVM VNC console using any VNC client](http://www.ibm.com/support/knowledgecenter/linuxonibm/liaat/liaatkvmsecvncclient.htm)
