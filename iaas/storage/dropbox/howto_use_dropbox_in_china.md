[Dropbox](https://www.dropbox.com/)是最早提供的云存储服务，也是最好的云存储服务。最大的优势是跨操作系统和跨硬件平台，不论是Windows, Mac 还是Linux，都能够无缝使用，Android和iOS系统也不在话下。

> 虽然苹果系有iCloud提供云存储同步，但是目前我使用的体验远不如Dropbox，即使在MacOS平台，文件不一致问题让我非常头疼。更何况，我的工作需要跨Linux/MacOS，使得Dropbox成为更优选择。

> 本文是[安装XUbuntu](../../../os/linux/ubuntu/install/install_xubuntu)之后，重新部署Dropbox客户端同步文件的笔记，实际上也是如何在China使用Dropbox的一个快速指南。

# 准备"梯子"（对墙内用户）

* 首先必须有一个海外的VPS，最小规格的Linux就可以，只需要运行SSH服务就满足要求。
* 确保自己的个人帐号能够通过ssh登录（最好使用密钥登录，例如Amazon的AWS即强制使用较为安全的密钥登录）
* 登录服务器，执行以下命令开启iptables的NAT模式（`MASQUERADE`）

```
sudo iptables -t nat -A POSTROUTING -j MASQUERADE

echo "net.ipv4.ip_forward = 1" | sudo tee /etc/sysctl.conf
sudo sysctl -p
```

* 在需要运行Dropbox客户端执行以下ssh命令，实现连接到服务器的动态端口转发

格式：

```
ssh -D local_port username@server_ip
```

举例，以下开启本地端口8888，使用帐号`zhangsan`连接到服务器 `myvps.xyz.com` 的动态端口转发

```
ssh -D 8888 zhangsan@myvps.xyz.com
```

此时，本地端口`8888`就是一个socks5的代理端口，设置Firefox的网络采用代理服务器，就设置socks5方式，`127.0.0.1`端口`8888`。注意，浏览器的DNS查询也必须走socks5端口。

> 参考[How to Use SSH Tunneling to Access Restricted Servers and Browse Securely](https://www.howtogeek.com/168145/how-to-use-ssh-tunneling/)

# 安装Dropbox

Dropbox官方提同的deb软件包实际上依赖gnome图形环境，对于轻量级的桌面Xfce或者LXQt等，需要安装大量的依赖软件包。不过，实际上，我们只需要使用基本的文件同步功能，并不需要和文件管理器紧密绑定。所以可以直接使用Dropbox提供的Headless模式，即在命令行启动服务，甚至可以运行在远程没有桌面的服务器上。

* 安装Dropbox

```
cd ~ && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -
```

> 在墙内无法直接下载文件，可以通过设置socks5代理的Firefox下载文件，然后在用户目录下解压缩

* 下载[Dropbox Python脚本](https://www.dropbox.com/download?dl=packages/dropbox.py)，然后重命名成可执行文件

```
sudo cp dropbox.py /usr/bin/dropbox
sudo chmod 755 /usr/bin/dropbox
```

* 运行Dropbox

```
screen -S dropbox -dm ~/.dropbox-dist/dropboxd
dropbox proxy manual socks5 127.0.0.1 8888
```

> 第2行命令是为了设置Dropbox使用本地socks5代理

此时会弹出浏览器要求登录验证，验证正确后就可以开始文件同步。