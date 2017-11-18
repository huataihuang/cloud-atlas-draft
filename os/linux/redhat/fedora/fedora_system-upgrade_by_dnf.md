最初[在MacBook Pro上实现Fedora和macOS双启动](os/linux/redhat/fedora/multiboot_fedora_and_macOS.md)安装的Fedora版本是26，近期Fedora 27正式发布，则准备通过dnf将整个操作系统版本升级到27。

* 首先使用`dnf`对系统进行标准升级

```
sudo dnf upgrade --refresh
```

> 以上升级完成后，建议重启系统，特别是刚安装了新内核的话。
>
> 仔细检查`/etc/dnf/dnf.conf`，如果使用了任何定制配置（不论是手工还是通过第三方工具）都建议先恢复到默认配置，再作系统升级。

* 安装`dnf-plugin-system-upgrade`软件包

```
sudo dnf install dnf-plugin-system-upgrade
```

* 下载Fedora 27系统更新包：

```
sudo dnf system-upgrade download --refresh --releasever=27
```

> 这里`--releasever=数值`表示希望升级到的不同系统版本。如果当前是Fedora 25，则可以升级到Fedora 26。也可以设置到`28`以升级到[Branched](https://fedoraproject.org/wiki/Branched)版本或者`rawhide`表示升级到[Rawhide](https://fedoraproject.org/wiki/Rawhide)版本（警告：这两个版本不是稳定版本）。

> 如果升级到Rewhide版本，需要针对该版本import rpm gpg key：

```
sudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-fedora-29-primary
```

* 如果一些软件包有不稳定的依赖，则升级将拒绝执行，直到添加一个`--allowerasing`选项。通常这在使用了第三方软件仓库时出现的软件仓库未及时更新导致。注意检查那些软件包被移除，注意移除的软件包可能和系统基本功能有关或者对运行的软件产品有关。

> * 在不安全的依赖情况下，可以通过`--best`选项来详细查看。
>
> * 如果在再次运行`dnf system-upgrade downlaod`命令前卸载了一些软件包，则建议使用 `--setopt=keepcache=1`的`dnf`命令参数，否则在操作前整个缓存会被清空，就需要再次下载软件包。

* 触发升级

```
sudo dnf system-upgrade reboot
```

> 注意：上述命令发出后系统会立即（秒速）重启，所以务必确保数据文件已经备份或保存，避免数据丢失。

以上等待升级完成即可，重启两次后即进入Fedora 27系统。

# 参考

* [DNF system upgrade](https://fedoraproject.org/wiki/DNF_system_upgrade)