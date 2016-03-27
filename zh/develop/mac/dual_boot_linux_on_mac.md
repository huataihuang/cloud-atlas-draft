> 如果你和我一样，既喜欢Mac笔记本精良的制作工艺，又喜欢OS X优雅灵活的图形工作平台，但是又需要Linux无穷尽的开源服务和虚拟化技术，你可能会考虑和我一样，在MacBook Pro笔记本上，安装双启动系统，随时切换OS X和Linux。

我的目标是日常工作中2/3使用Linux，以便能够锤炼KVM/Docker等虚拟化技术，以及部署模拟各种服务。另外1/3工作使用OS X系统，来实现一些Linux无法达到的图形工作环境。（毕竟，有很多商业软件在Linux下无法使用，我主要的工作是围绕Linux服务器开发和维护，没有必要在Linux桌面上花费太多时间和精力）

虽然OS X提供了Boot Camp可以安装双操作系统，但是Boot Camp只支持Windows安装，并不能用于Linux dual boot。解决的思路是使用[rEFInd](http://sourceforge.net/projects/refind/)作为boot loader，然后使用Mac OS X的Disk Utility将当前的OS X系统的分区缩小，空出空间来安装Linux操作系统。

具体方法可以参考：

* [How to Install and Dual Boot Linux on a Mac](http://www.howtogeek.com/187410/how-to-install-and-dual-boot-linux-on-a-mac/)
* [Dual Boot Kali on Mac Hardware](http://docs.kali.org/installation/kali-linux-dual-boot-on-mac-hardware) 这个文档介绍了使用开源的GParted来重新划分分区，不过，个人觉得对于Mac OS X分区，还是使用系统自带的Disk Utility更为成熟可靠。

# rEFInd

rEFInd是从rEFIt项目fork出来的，并且支持传递内核参数。rEFInd是一个启动管理器，在主机首次启动时候提供菜单选项，当它加载了一个OS内核后会放弃控制。（从版本3.3.0开始，Linux内核包含了一个内建的boot loader）所有EFI-capable OS都包含了一个boot loader。实际上，Linux内核可以作为自己的一个EFI boot loader工作，这使得rEFInd特性类似Linux的一个boot loader。

> [Arch Linux - Unified Extensible Firmware Interface](https://wiki.archlinux.org/index.php/Unified_Extensible_Firmware_Interface) 提供了详细的介绍EFI技术。

* 从 [rEFInd](http://www.rodsbooks.com/refind/) 下载最新的binary zip文件

> 需要将获取的rEFInd二进制文件安装到主机的EFI系统分区，这个安装取决于操作系统和主机（UEFI的PC或者Macintosh）。在Linux或Mac OS X上，最简单的安装rEFInd的方法是使用`install.sh`脚本，这个脚本自动复制rEFInd文件到ESP或者其它目标位置，并更改firmware的NVRAM设置，这样下次启动就会启动rEFInd。如果你已经在UEFI-based主机上启动到OS X或者非安全启动EFI模式的Linux，`install.sh`就会这样操作。如果安装无效，或者主机是使用secure boot，或者希望创建一个使用rEFInd的U盘，则需要阅读[extra instructions](http://www.rodsbooks.com/refind/installing.html)

```bash
cd refind-bin-0.10.2
./refind-install
```

提示

```bash
**** ALERT: SIP ENABLED! ****

rEFInd cannot be installed because System Integrity Protection (SIP) seems
to be enabled! You must install rEFInd from your Recovery installation or
from another OS. To install from the Recovery system:

  1. Reboot
  2. Hold down Command+R as the chime sounds
  3. When the OS has booted, select Utilities->Terminal
  4. Change to this directory with the 'cd' command; it will probably be under
     /Volumes/MacBook Pro/Users/huatai/Downloads/refind-bin-0.10.2
  5. Re-run this script.

If you believe SIP is NOT enabled, you may attempt an installation anyhow,
but it may fail.

For more on this subject, see http://www.rodsbooks.com/refind/sip.html
```

## SIP(System Integrity Protection)

> 苹果的OS X 10.11（也称为EI Capitan）包含了一个称为系统一致性保护（System Integrity Protection, SIP）的功能，也称为`rootless`模式。这个功能对于高级用户是非常震撼的，因为它限制了一些操作不可进行，即使你是`root`用户。

对于Unix系统中，包括OS X，传统上提供了一种安全模式，即用户只能读写他们自己的文件，但是不能写入系统文件（例如程序，系统配置文件等），以及普通用户不能读一些系统文件。这种系统安全模式在传统的Unix系统中工作良好，并且对于计算机专家和缺乏经验的用户都非常适合。对于系统管理任务，则使用`root`帐号，例如在Mac上，是通过`sudo`命令或者一些GUI工具来实现帐号切换。在Mac上，缺乏传统Unix系统管理经验的普通用户也需要执行一些系统管理任务，如安装新软件和配置网络设置。OS X提供了SIP，默认在OS 10.11上启用，来限制用户执行一些管理任务，即虽然还是能够安装或删除第三方程序，配置网络，但是一些关键目录是不可写入的，即使你切换到`root`帐号，OS X也会阻止你更改关键目录以及不能使用一些特殊工具。这些限制影响了`rEFInd`，因为其中一个称为`bless`的工具命令，需要告诉Mac从rEFInd启动而不是直接启动OS X，但是这个操作被SIP所禁止。

有三种方式在SIP激活的Mac上安装rEFInd:

* 使用[Recovery mode](http://www.rodsbooks.com/refind/sip.html#recovery)启动系统
* [禁用SIP](http://www.rodsbooks.com/refind/sip.html#disable)（暂时或永久）
* 使用[第三方OS启动系统](http://www.rodsbooks.com/refind/sip.html#another)然后安装rEFInd

### 使用Recovery mode

除非删除Recovery HD分区，否则Recovery HD分区就可以执行一种称为紧急恢复的操作。这个工具的本质是当使用Recovery HD分区时SIP就不会激活，所以你可以从这个分区启动然后安装rEFInd。不过，这个方式的困难是，这并不是一个完整的OS X系统，有可能在这种底层环境非常难使用。不过，这个方式是在Mac OS X 10.11上安装rEFInd最好的方式。步骤如下：

* 首先[下载rEFInd二进制.zip文件](http://www.rodsbooks.com/refind/getting.html)并解压缩
* 重启主机，在听到chime声音的时候按`Command+R`（进入Mac的recovery模式）
* 当OS启动后，选择 Utilities -> Terminal
* 进入到下面的目录（和你存放refind下载解压缩的目录有关，这里假设用户名是`jerry`，所以用户目录就是`/Volume/OS X/Users/jerry`）

```bash
cd /Volume/OS X/Users/jerry/Downloads/refind-bin-0.10.2
./refind-install
```

* 重启就可也看到rEFInd启动界面（不需要使用`option`键），表明rEFInd接管了EFI启动，这样就可以开始从U盘Linux启动进行安装了。

### 关闭SIP

如果上述Recovery mode方式没有成功，也可以使用暂时关闭SIP（安装完rEFInd之后再恢复）方法。具体就是先重启到Recovery，使用Recovery Hd分区的命令

```bash
csrutil disable
```

## 使用rEFInd来管理SIP

一旦rEFInd安装完成，就可以使用它来管理SIP。首先需要在`refind.conf`配置文件中添加以下行：

* `showtools`
* `csr_values`

通常配置如下

```bash
showtools shell,memtest,gdisk,csr_rotate,apple_recovery,windows_recovery,about,shutdown,reboot
csr_values 10,77
```

这样重启后就会进入rEFInd，并且可以使用工具

----

下一步[在MacBook Pro上安装Gentoo Linux](../../os/linux/gentoo/install_gentoo_on_macbook_pro.md)实现双启动后的Gentoo Linux安装。

> 当前流行的[GPU CUDA开发也可以使用MacBook Pro的NVIDIA GeForce GT 750M](https://www.researchgate.net/post/What_are_the_required_configuration_of_a_PC_to_run_Cuda)。