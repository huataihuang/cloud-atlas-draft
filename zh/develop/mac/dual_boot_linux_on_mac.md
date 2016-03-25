> 如果你和我一样，既喜欢Mac笔记本精良的制作工艺，又喜欢OS X优雅灵活的图形工作平台，但是又需要Linux无穷尽的开源服务和虚拟化技术，你可能会考虑和我一样，在MacBook Pro笔记本上，安装双启动系统，随时切换OS X和Linux。

我的目标是日常工作中2/3使用Linux，以便能够锤炼KVM/Docker等虚拟化技术，以及部署模拟各种服务。另外1/3工作使用OS X系统，来实现一些Linux无法达到的图形工作环境。（毕竟，有很多商业软件在Linux下无法使用，我主要的工作是围绕Linux服务器开发和维护，没有必要在Linux桌面上花费太多时间和精力）

虽然OS X提供了Boot Camp可以安装双操作系统，但是Boot Camp只支持Windows安装，并不能用于Linux dual boot。解决的思路是使用[rEFInd](http://sourceforge.net/projects/refind/)作为boot loader，然后使用Mac OS X的Disk Utility将当前的OS X系统的分区缩小，空出空间来安装Linux操作系统。

具体方法可以参考：

* [How to Install and Dual Boot Linux on a Mac](http://www.howtogeek.com/187410/how-to-install-and-dual-boot-linux-on-a-mac/)
* [Dual Boot Kali on Mac Hardware](http://docs.kali.org/installation/kali-linux-dual-boot-on-mac-hardware) 这个文档介绍了使用开源的GParted来重新划分分区，不过，个人觉得对于Mac OS X分区，还是使用系统自带的Disk Utility更为成熟可靠。

此外，当前流行的[GPU CUDA开发也可以使用MacBook Pro的NVIDIA GeForce GT 750M](https://www.researchgate.net/post/What_are_the_required_configuration_of_a_PC_to_run_Cuda)