> 实际上最新的MacBook产品使用的T1/T2安全芯片对第三方操作系统极其不友好，目前Linux在新版Macbook上运行还存在很多驱动问题，个人觉得还是太折腾了，作为主力工作电脑会花费太多精力，并且无法充分发挥苹果设备的功能和性能。作为技术尝试可以，但是不建议作为主力设备。
>
> 我个人还没有做这方面实践，毕竟要自废武功(抛弃掉苹果软硬件一体化的完善软件体系)，而且我的技术重点是服务器端技术和开发，无法顾及太多这方面的hack技巧。
>
> 运行Linux系统我还是使用旧版的MacBook Pro(2013 late)主机和ThinkPad X220这样的Linux完善支持的设备。

最新款的MacBook Pro使用了TouchBar，功能强大，但是对于Linux支持目前还差强人意：

* 最新的MacBook Pro和MacBook使用了SPI(Serial peripheral interface，串口周边接口)用于键盘/触摸板和touchbar，和其他笔记本使用的接口不同，所以Linux发行版较难兼容。目前Ubuntu 18.04已经能够驱动键盘和touchbar，相信已经得到了较好的支持。
* 2019年的进展状况参考 [The state of Linux on a MacBook Pro with Touchbar](https://geeknet.me/the-state-of-linux-on-a-macbook-pro-with-touchbar/)

以下两个github上的文档是非常完善的经验汇总(2018年之前使用T1芯片的Macbook产品)，值得参考和借鉴

* [Dunedan/mbp-2016-linux](https://github.com/Dunedan/mbp-2016-linux/blob/master/README.md) 搜集了有关MacBook Pro 2016&2017版本的Linux支持状态，非常详尽的信息汇总，可以作为参考起点。
* [roadrunner2/0 Linux-On-MBP-Late-2016.md](https://gist.github.com/roadrunner2/1289542a748d9a104e7baec6a92f9cd7)介绍了安装经验，非常

当前(2021年初)，fedora已经能比较顺畅安装在具备T2芯片的Macbook产品上(2018年及以后的产品)，不过需要借鉴以下文档实践：

* [mikeeq/mbp-fedora](https://github.com/mikeeq/mbp-fedora) 汇总了驱动信息和安装经验

----

* Reddit上的[What Linux distro works with 2017 MacBook touchbar?](https://www.reddit.com/r/MacOS/comments/7zyufn/what_linux_distro_works_with_2017_macbook_touchbar/)讨论了在MacBook Pro with touchbar上运行Linux的事情。
* [Linux on mid-2017 MacBookPro](https://nixaid.com/linux-on-macbookpro/)介绍了在MacBook Pro Core i7 2.9 15" Touch/Mid-2017 with AMD Radeon Pro 560硬件平台安装Ubuntu Linux的方法：
  * Ubuntu 18.04（Linux 4.15.0-22）提供了能够支持touchbar和键盘



在最新款的MacBook Pro上运行Linux最好通过[VMware Fusion](../../virtual/vmware/vmware_fusion)或者[HyperKit/xhyve](../../virtual/xhyve/README)

* 使用macOS最新版本和VMware Fusion Pro来虚拟机运行Linux
* Fusion支持高级虚拟化功能，可以透传硬件（virt-x/virt-d），所以可以直接在Linux中测试硬件虚拟化，构建OpenStack
* 使用macOS可以充分发挥硬件性能，并且不需要折腾Linux图形界面。上帝的归上帝，凯撒的归凯撒，Linux最好的是服务端开发，图形工作界面使用macOS可以节约大量的时间。

不过，我也准备采用双启动方式，在裸Linux下运行一个开发测试平台以便能够充分利用强大的MacBook Pro硬件性能和硬件特性。

----

参考 [How can you get any version of Linux to see the 2018 MacBook Pro SSD?](https://unix.stackexchange.com/questions/463422/how-can-you-get-any-version-of-linux-to-see-the-2018-macbook-pro-ssd/471124#471124):由于最新的Mac硬件配备了T2安全芯片，所以只有通过Boot Camp才能安装第三方操作系统，而Boot Camp只支持Windows 10。这就导致无法在MacBook Pro 2018上直接安装Linux操作系统，即使关闭[Secure Boot](https://support.apple.com/en-us/HT208330)也无法看到内置硬盘，所以无法安装系统。可能的解决方案是采用外接U盘来安装运行Linux系统，因为T2芯片不阻止外接U盘启动

不过，最新的[NVMe驱动内核补丁(没有进入主线)](https://www.phoronix.com/scan.php?page=news_item&px=MacBook-Finally-Linux-SSD-RW)已经开始支持读写MacBook Pro硬盘，所以理论上可以安装Linux到最新的MacBook Pro笔记本。具体需要参考 [MacBookPro 15,1/2? #71](https://github.com/Dunedan/mbp-2016-linux/issues/71#issuecomment-507325112) 进展。这个issue中，TRPB提供了一个在MacBook Pro 2018上运行Linux的指南 [arch-macbook2018.md](https://gist.github.com/TRPB/437f663b545d23cc8a2073253c774be3)