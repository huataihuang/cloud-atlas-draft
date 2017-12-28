现代操作系统和笔记本有一个非常好的功能：当合上笔记本时自动休眠（suspend），打开时自动恢复到上次工作的状态，大大提高了使用效率。这点在macOS上特别突出，基本上可以保持几周甚至几个月无需重启。

在[MacBook Pro上实现Fedora和macOS双启动](../../redhat/fedora/multiboot_fedora_and_macOS)自然也继承了使用MacBook的习惯，特别是[解决了suspended后数秒无故wake up问题（"ACPI: Waking up from system sleep state S3"）](acpi_wake_up_system_sleep_state_s3)之后，使用ACPI电源管理方便了办公室、家庭移动办公。不过，有一点和macOS不同的是，Linux上默认按下电源按钮就会关机，而不是象macOS进入休眠。这个特性让我非常苦恼，往往习惯性一按电源键，导致操作系统shutdown。

其实macOS的设置更人性化，对于现代笔记本操作系统，关机是极少情况下才需要的操作，而休眠并快速唤醒才是最常见的场景。

怎样把电源键的动作修改成休眠（suspend）呢？

`systemd`处理一些电源相关的ACPI事件，可以通过`/etc/systemd/logind.conf`或者`/etc/systemd/logind.conf.d/*.conf`配置。在一些没有独立电源管理的系统，systemd可能取代了`acpid`服务，来处理ACPI事件：

每一个事件的对应动作可以是以下动作之一：

* `ignore`
* `poweroff`
* `reboot`
* `halt`
* `suspend`
* `hibernate`
* `hybrid-sleep`
* `lock`
* `kexec`

> 在 `hibernation` 和 `suspension` 需要相应的配置。如果事件没有配置，则systemd采用默认操作

| Event handler | Description | Default action |
| ---- | ---- | ---- |
| HandlePowerKey 	        | 电源键按下时触发 | poweroff |
| HandleSuspendKey 	        | suspend键按下时触发 | suspend |
| HandleHibernateKey 	    | hibernate键按下时触发 | hibernate |
| HandleLidSwitch 	        | 笔记本屏幕合上时触发（除非笔记本安装在dock上）| suspend |
| HandleLidSwitchDocked 	| 当笔记本插在dock底座上，或者多于一个显示器连接情况下合上笔记本屏幕 | ignore |

回到上面的问题，修改`/etc/systemd/logind.conf`配置（默认已经有对应配置，默认设置都是有`#`注释掉的，所以要设置非默认配置，则取消`#`注释再修改）：

```bash
[Login]
#HandlePowerKey=poweroff
HandlePowerKey=suspend
```

然后重启`systemd-logind`

```
systemctl restart systemd-logind
```

> `hibernate`还需要更多配置（配置磁盘存储内存内容），但是如果[在MacBook Pro安装Fedora和macOS双启动](../../redhat/fedora/multiboot_fedora_and_macOS)，则使用`hibernate`就具有非常大的优势：只要按一下电源键就可以将当前Linux工作状态保存并关机，再次启动笔记本就可以在两种操作系统之间切换，并且回到Linux桌面时完全恢复原有工作状态，带来了极大的效率提升。
>
> 详细的`hibernate`睡眠设置见[通过systemd设置fedora系统hibernate休眠](../../redhat/system_administration/systemd/hibernate_with_fedora_in_laptop)

> 在[通过systemd设置禁止合上笔记本屏幕suspend](../../redhat/system_administration/systemd/disable_suspend_when_close_laptop_lid)采用了相同的原理，则是针对将笔记本电脑作为开发服务器使用，实现合上屏幕不进入休眠，始终在线运行的设置方法。

# 参考

* [archLinux: Power management](https://wiki.archlinux.org/index.php/Power_management)