最新款的MacBook Pro使用了TouchBar，功能强大，但是对于Linux支持目前还差强人意：

* 最新的MacBook Pro和MacBook使用了SPI(Serial peripheral interface，串口周边接口)用于键盘/触摸板和touchbar，和其他笔记本使用的接口不同，所以Linux发行版较难兼容。目前Ubuntu 18.04已经能够驱动键盘和touchbar，相信已经得到了较好的支持。
* [Dunedan/mbp-2016-linux](https://github.com/Dunedan/mbp-2016-linux/blob/master/README.md) 搜集了有关MacBook Pro 2016&2017版本的Linux支持状态，非常详尽的信息汇总，可以作为参考起点。
* [roadrunner2/0 Linux-On-MBP-Late-2016.md](https://gist.github.com/roadrunner2/1289542a748d9a104e7baec6a92f9cd7)介绍了安装经验。
* Reddit上的[What Linux distro works with 2017 MacBook touchbar?](https://www.reddit.com/r/MacOS/comments/7zyufn/what_linux_distro_works_with_2017_macbook_touchbar/)讨论了在MacBook Pro with touchbar上运行Linux的事情。
* [Linux on mid-2017 MacBookPro](https://nixaid.com/linux-on-macbookpro/)介绍了在MacBook Pro Core i7 2.9 15" Touch/Mid-2017 with AMD Radeon Pro 560硬件平台安装Ubuntu Linux的方法：
  * Ubuntu 18.04（Linux 4.15.0-22）提供了能够支持touchbar和键盘

在最新款的[MacBook Pro上运行Linux最好通过VMware Fusion来实现](../../virtual/vmware/vmware_fusion)：

* 使用macOS最新版本和VMware Fusion Pro来虚拟机运行Linux
* Fusion支持高级虚拟化功能，可以透传硬件（virt-x/virt-d），所以可以直接在Linux中测试硬件虚拟化，构建OpenStack
* 使用macOS可以充分发挥硬件性能，并且不需要折腾Linux图形界面。上帝的归上帝，凯撒的归凯撒，Linux最好的是服务端开发，图形工作界面使用macOS可以节约大量的时间。

不过，我也准备采用双启动方式，在裸Linux下运行一个开发测试平台以便能够充分利用强大的MacBook Pro硬件性能和硬件特性。