在使用Xfce桌面时，需要选择一个轻量级的显示管理器，例如 slim 。不过，我也想尝试一下在 [archlinux: Display manager](https://wiki.archlinux.org/index.php/display_manager)中介绍的字符终端显示管理器，例如，[Ly](https://github.com/cylgom/ly)

* 安装编译依赖:

```
sudo apt install libpam0g-dev
```

* 下载:

```
git clone --recurse-submodules https://github.com/cylgom/ly.git
```

* 编译：

```
make
```

* 检查是否工作在配置的 tty，默认是 tty2

```
sudo make run
```

* 安装Ly以及systemd服务文件:

```
sudo make install
```

* 激活systemd服务以便确保能够启动时启动

```
sudo systemctl enable ly.service
```

* 由于systmed默认在tty2上启动了getty，所以会导致Ly服务无法在tty2上启动，所以需要先执行以下命令：

```
sudo systemctl disable getty@tty2.service
```

不过，我在Ubuntu 18.04 Server上实践没有成功。最后还是遗憾放弃。