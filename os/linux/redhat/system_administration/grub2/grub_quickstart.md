在Linux系统启动时，通常会见到GRUB窗口，提供你选择哪种内核或参数启动。

[GRUB](https://www.gnu.org/software/grub/)是一个加载和管理启动进程的程序，也是Linux发行版最常用的bootloader。GRUB是 `GRand Unified Bootloader` 的缩写，就是启动时候接手BIOS工作，加载自身，然后加载Linux内核到内存，然后执行内核。一旦内核接手系统，GRUB就完成了任务不再需要运行。

所谓bootloader就是计算机启动时候运行的第一个程序，bootloader负责加载操作系统的内核，然后内核就会初始化操作系统的其他部分：shell，显示管理器，桌面环境等等。

# boot loader 和 boot manager

bootloader就是第一个启动并用来加载执行内核到内存然后运行内核的程序。而boot manager程序则允许你选择不通的操作系统（如果主机上安装了多个操作系统），注意boot manager不是用来直接加载OS的。

从Linux Kernel version 3.3开始，Linux内核内建了一个EFI bootloader。实际上，任何和EFI系统兼容的操作系统都包含了一个EFI bootloader。在EFI兼容系统中(例如MacBook)，firmware会读取EFI系统分区来找到EFI文件的启动信息。GRUB就是一个bootloader兼boot manager。其他类似的流行boot manager有 rEFInd boot manager，我曾经使用它来在MacBook Pro上同时安装运行Linux和macOS。

# GRUB常用技巧

在GRUB菜单显示的时候，按下 `e` 按键可以进入编辑模式，此时可以修改内核启动参数，特别适合一些异常排查过程。

# GRUB修改

默认GRUB配置文件位于 `/etc/default/grub` ，也有一个 `/etc/default/grub.d` 目录提供了附加的配置 `.cfg` 文件。

ubuntu和其他一些发行版提供了一个更新grub的工具 `update-grub` ，当修改了GRUB配置之后，执行 `sudo update-grub` 就能够更新grub。不过，如果系统没有提供 `update-grub` 工具的话也不必担心，你可以通过以下命令生成 `grub2` 配置文件:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

安装Linux发行版的时候，通常会询问是否要安装 `grub boot loader` ，这个grub一部分安装在 `MBR/ESP` 分区，一部分则位于 `/boot/grub` 目录。而 `update-grub` 就是查看 `boot` 目录，将 `vmlinuz` 作为内核以及找到对应的ramdisk image的initrd行配置加入到配置中，并且会使用 `os-prober` 来查看所有的磁盘分区中是否有其他操作系统，然后加入到grub菜单。

# 参考

* [Linux Jargon Buster: What is Grub in Linux? What is it Used for?](https://itsfoss.com/what-is-grub/)
* [How to Update Grub on Ubuntu and Other Linux Distributions](https://itsfoss.com/update-grub/)
* [An introduction to GRUB2 configuration for your Linux machine](https://opensource.com/article/17/3/introduction-grub2-configuration-linux)