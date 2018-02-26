最近一次`apt upgrade`，升级后提示信息：

```
The link /vmlinuz.old is a damaged link
Removing symbolic link vmlinuz.old 
 you may need to re-run your boot loader[grub]
The link /initrd.img.old is a damaged link
Removing symbolic link initrd.img.old 
 you may need to re-run your boot loader[grub]
```

参考[How do I re-run boot loader?](https://askubuntu.com/questions/518997/how-do-i-re-run-boot-loader)

根据[Damaged /vmlinuz and /initrd.img symbolic links after Kernel uninstall](https://serverfault.com/questions/4427/damaged-vmlinuz-and-initrd-img-symbolic-links-after-kernel-uninstall)问答中[womble的答案](https://serverfault.com/a/4439/99345)，如果使用的时GRUB/GRUB2作为boot loader，就不需要做任何事情。

如果使用其他boot loader，例如LILO，就需要手工运行boot loader的配置。

如果你不许要告诉GRUB检查现在的内核和更新它的配置，则运行`sudo update-grub`，这个命令没有害处，但是在这个案例下没有必要。

执行了`update-grub`之后，还有一个提示信息

```
Warning: Setting GRUB_TIMEOUT to a non-zero value when GRUB_HIDDEN_TIMEOUT is set is no longer supported.
```

参考[Warning: Setting GRUB_TIMEOUT to a non-zero value when GRUB_HIDDEN_TIMEOUT is set is no longer supported.](https://bugs.launchpad.net/ubuntu/+source/grub2/+bug/1258597)，编辑`/etc/default/grub`，将`GRUB_HIDDEN_TIMEOUT=0`注释掉：

```
GRUB_DEFAULT=0
#GRUB_HIDDEN_TIMEOUT=0
GRUB_HIDDEN_TIMEOUT_QUIET=true
GRUB_TIMEOUT=10
...
```

然后再执行一次`update-grub`就不再提示这个警告信息。