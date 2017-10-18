> 如果你和我一样，既喜欢Mac笔记本精良的制作工艺，又喜欢OS X优雅灵活的图形工作平台，但是又需要Linux无穷尽的开源服务和虚拟化技术，你可能会考虑和我一样，在MacBook Pro笔记本上，安装双启动系统，随时切换OS X和Linux。

我的目标是日常工作中2/3使用Linux，以便能够锤炼KVM/Docker等虚拟化技术，以及部署模拟各种服务。另外1/3工作使用OS X系统，来实现一些Linux无法达到的图形工作环境。（毕竟，有很多商业软件在Linux下无法使用，我主要的工作是围绕Linux服务器开发和维护，没有必要在Linux桌面上花费太多时间和精力）

虽然OS X提供了Boot Camp可以安装双操作系统，但是Boot Camp只支持Windows安装，并不能用于Linux dual boot。解决的思路是使用[rEFInd](http://sourceforge.net/projects/refind/)作为boot loader，然后使用Mac OS X的Disk Utility将当前的OS X系统的分区缩小，空出空间来安装Linux操作系统。

具体方法可以参考：

* [How to Install and Dual Boot Linux on a Mac](http://www.howtogeek.com/187410/how-to-install-and-dual-boot-linux-on-a-mac/)
* [Dual Boot Kali on Mac Hardware](http://docs.kali.org/installation/kali-linux-dual-boot-on-mac-hardware) 这个文档介绍了使用开源的GParted来重新划分分区，不过，个人觉得对于Mac OS X分区，还是使用系统自带的Disk Utility更为成熟可靠。

# 安装rEFInd

有关详细安装rEFInd工具可参考[rEFInd详解](refind.md)，步骤简述如下：

* 首先[下载rEFInd二进制.zip文件](http://www.rodsbooks.com/refind/getting.html)并解压缩
* 重启主机，在听到chime声音的时候按`Command+R`（进入Mac的recovery模式）
* 当OS启动后，选择 Utilities -> Terminal
* 进入到下面的目录（和你存放refind下载解压缩的目录有关，这里假设用户名是`jerry`，所以用户目录就是`/Volume/OS X/Users/jerry`）

```bash
cd /Volume/OS X/Users/jerry/Downloads/refind-bin-0.10.2
./refind-install
```

# 调整分区

安装rEFInd之后，再次启动到Mac OS X系统中，然后使用`Disk Utility`将当前的`Macintosh HD`分区缩小，空出部分磁盘空间用于后续的Linux安装

![使用Disk Utility调整分区大小](/img/develop/mac/resize_partition.png)

下一步[在MacBook上安装Gentoo Linux](../../os/linux/gentoo/install_gentoo_on_macbook.md)实现双启动后的Gentoo Linux安装。

> 当前流行的[GPU CUDA开发也可以使用MacBook Pro的NVIDIA GeForce GT 750M](https://www.researchgate.net/post/What_are_the_required_configuration_of_a_PC_to_run_Cuda)，参考[CUDA GPUs](https://developer.nvidia.com/cuda-gpus)说明：NVIDIA GeForce GT 750M支持CUDA 3.0，并且根据当前[Installing TensorFlow on Ubuntu:NVIDIA requirements to run TensorFlow with GPU support](https://www.tensorflow.org/install/install_linux#NVIDIARequirements)介绍，TensorFlow运行支持GPU要求的最低版本恰好是GPU card with CUDA Compute Capability 3.0 or higher，即可以在MacBook Pro上进行基本的GPU开发以及TensorFlow的开发。