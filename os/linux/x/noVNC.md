noVNC是HTML VNC客户端JavaScript库以及基于这个库构建的应用程序。noVNC可以在任何现代化浏览器，包括移动浏览器中运行（iOS和Android）。

很多公司，项目以及产品都集成了noVNC，包括 OpenStack, OpenNebula, LibVNCServer 和 ThinLinc。

只需要在服务器上运行noVNC，客户端就不再需要安装VNC客户端，直接通过浏览器访问服务器即可以直接访问QEMU所提供的VNC。

# 浏览器要求

noVNC使用很多现代web技术，当前至少需要满足以下要求的浏览器：

Chrome 49, Firefox 44, Safari 10, Opera 36, IE 11, Edge 12

# 服务器要求

noVNC遵循标准VNC协议，但是不像其他VNC客户端要求WebSockets支持。大所属服务器都已经支持（例如，[x11vnc/libvncserver](http://libvncserver.sourceforge.net/), [QEMU](http://www.qemu.org/) 和 [MobileVNC(http://www.smartlab.at/mobilevnc/)），但是其他服务器则需要使用WebSockets to TCP socket proxy。

# 安装

下载clone代码

```
git clone https://github.com/novnc/noVNC.git
```

运行

```
./utils/launch.sh --vnc localhost:5901
```

## Ubuntu安装

Ubuntu的apt安装包有noVNC，可以直接安装

```
suo apt install novnc
```

安装以后通过以下命令实现一个转发方式访问指定端口

```
/usr/bin/websockify [options] [source_addr:]source_port [target_addr:target_port]
```

> 注意：如果没有指定`source_addr`，则默认转发的`source_port`会监听在所有网络接口上。这就需要注意，QEMU的默认VNC端口是监听在`127.0.0.1`接口上。如果没有指定`source_addr`，则不能将`source_port`和 `target_port` 设置成相同值。
>
> 举例：`win10`虚拟机的QEMU的VNC是绑定在`127.0.0.1:5900`，则不能使用`5900 localhost:5900`，会出现端口已经绑定的错误。但是可以使用`192.168.0.2:5900 127.0.0.1:5900`。这样novnc就监听在物理主机的外网接口。

具体来说，就是在服务器上要针对每个QEMU的VNC端口设置一个转发，不过需要注意的是，这个程序转发是前台工作方式，所以假设我需要设置2个虚拟机的端口novnc则输入命令：

```
screen -S vnc0 -dm /usr/bin/websockify 192.168.0.2:5900 localhost:5900
screen -S vnc1 -dm /usr/bin/websockify 192.168.0.2:5901 localhost:5901
```

> 这里使用了`screen -S vnc0 -dm`是为了能够使得`websockify`持续运行。不过，也可以使用`websockify`的参数`--daemon`或者`-D`来实现，即表示以服务方式运行。


* novnc提供了一个简单的WEB服务器，可以读取目录`/usr/share/novnc`实现一个简单的noVNC的web，这样用户就可以直接用浏览器访问

```
/usr/bin/websockify --web /usr/share/novnc 8787 localhost:5900
```

这里 `/usr/share/novnc` 目录就是提供WEB客户端的目录，不过这种方式只能启动一个服务端口对应一个服务。如果要实现一个WEB能够对应多个VM。此时，通过 http://<server_ip>:8787/vnc.html 就可以访问界面，输入访问的IP地址 127.0.0.1 端口 8787 就可以看到在 127.0.0.1:5900 端口上的QEMU的VNC。

> 注意：同样要确保使用不同接口才能使用相同端口，例如`192.168.0.2:5900 localhost:5900`

```
screen -S vnc0 -dm /usr/bin/websockify --web /usr/share/novnc 192.168.0.2:5900 localhost:5900
screen -S vnc1 -dm /usr/bin/websockify --web /usr/share/novnc 192.168.0.2:5901 localhost:5901

screen -S vnc -dm /usr/bin/websockify --web /usr/share/novnc 8787 localhost:5900
```

此时就可以通过浏览器访问 http://192.168.0.2:8787 ，然后通过在页面上输入 `127.0.0.1` 端口 `5900` 或者端口 `5901` 访问到不同的桌面。

> 比较奇怪，novnc似乎是针对转发目标主机和port来设置访问

# 进一步实践

[How to access VNC remote desktop in web browser](http://xmodulo.com/access-vnc-remote-desktop-web-browser.html) 提供了更为详细的解决步骤

# 参考

* [noVNC](https://github.com/novnc/noVNC)
* [Connect to Your Ubuntu Machine with an HTML5 VNC Client](https://2buntu.com/articles/1290/connect-to-your-ubuntu-machine-with-an-html5-vnc-client/)
* [noVNC Advanced usage](Advanced usage)
* [How to access VNC remote desktop in web browser](http://xmodulo.com/access-vnc-remote-desktop-web-browser.html)