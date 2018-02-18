> 这里摘录了LFS的前言部分以便能够粗略了解这个项目

# 前言

[Gerard Beekmans](https://linux.cn/lfs/LFS-BOOK-7.7-systemd/prologue/foreword.html)最初对各个发行版本都存在一些不满，决定从源码编译完成整个操作系统。他在Linux分享了自己定制Linux系统的步骤后，得到了大家的关注和支持，最终形成了Linux From Scratch（LFS）项目。

LFS项目的目标是帮助你了解Linux内部是如何工作的，以及对系统本身有更多的控制，在各个方面都需要亲力亲为。

通过LFS可以创建极其精简的Linux系统，剔除掉发行版强迫安装你所用不到的程序。特别对于资源高度敏感的引导CD，USB棒或者嵌入系统，LFS非常适合这种资源有限的环境运行。

另外，通过从源码构建一个完整的系统，你可以审核所有的代码和打入所需的安全补丁，避免了花很长时间去等待别人编译修复了安全漏洞的二进制程序。

# LFS的目标架构

 LFS 当前主要支持 AMD/Intel 的 x86(32 位)和 x86_64(64 位) CPU。另外，本文档也涉及一些更改可以让 LFS 顺利地在 Power PC 和 ARM CPU 上运行。

 按照LFS的默认构建方式，将得到一个“纯”64位系统————这意味着你仅能够执行64位的程序。如果要构建支持32位程序，则参考[Cross Linux From Scratch](http://trac.clfs.org/)。

 > 一些异常老旧的包因为包含一些与32位系统紧密相关的汇编指令而不能在纯64位系统上构建。另外，根据我的经验Androio的开发中模拟器需要32位库支持才能运行。

# 准备

构建LFS需要对Unix系统管理有一定了解，同时也建议具备使用和安装Linux的基础知识。这些基础支持可以通过以下参考获得：

* [编译软件 HOWTO](http://www.tldp.org/HOWTO/Software-Building-HOWTO.html)
* [Linux 用户指南](http://tldp.org/pub/Linux/docs/ldp-archived/users-guide/)

# 宿主系统需求

大部分现代Linux已经具备了作为宿主的软加包，不过需要注意发行版的头文件通常是单独打包的，并且命名为 `<package-name>-devel` 或是 `<package-name>-dev` 这样的形式。务必保证这样的包都已经装上！