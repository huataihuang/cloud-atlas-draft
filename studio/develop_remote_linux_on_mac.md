> 参考 [通过SSHFS在Mac上远程开发Linux服务器程序](../develop/mac/sshfs)

在Mac电脑上，通过sshfs可以挂载远程Linux服务器上目录，甚至可以通过ssh转发方式访问特定服务器上目录，实现远程开发Linux程序：

* 从 [FUSE for macOS](https://osxfuse.github.io/) 下载安装 FUSE for macOS 3.6.0
* 从 [osxfuse/sshfs](https://github.com/osxfuse/sshfs/releases/) 下载安装 SSHFS 2.5.0
* 从 [SSHFS GUI Wrapper for Mac OS X](https://github.com/dstuecken/sshfs-gui) 下载 sshfs-gui 1.3.1

依次安装完成后，直接使用 SSHFS GUI图形界面就可以将远程ssh登录服务器上的目录挂载到本地目录上。

![SSHFS](../../img/develop/mac/sshfs.png)

开发环境共享目录设置在物理服务器上，分别通过虚拟机内部网段输出NFS和外部（物理）网段输出sshfs来实现文件交换：[NFS设置和共享目录](nfs_and_share.md)