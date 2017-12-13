# Anbox

[Anbox](https://github.com/anbox/anbox)是一个基于容器的在Ubuntu上启动一个完整Android系统的开源项目。这样，可以不需要虚拟化来运行Android。

Anbox使用Linux namespaces（user, pid, uts, net, mount, ipc）来运行一个完整的Android系统，以容器运行，提供在不同的GNU/Linux平台。

在容器中的Android不会直接访问任何硬件，所有硬件访问都通过anbox的daemon。Anbox重用了基于QEMU模拟OpenGL ES加速渲染。在容器中的Android系统使用不同的管道（pipes）来和host主机系统通讯以及发送所有的硬件访问指令。

> 从上述架构来看，似乎只有容器部分替代了Android官方通过kvm加速模拟器的部分，理论上性能会有所提高。但是也带来了稳定性问题和风险。Android官方是使用kvm来完全隔离和运行一个完整android系统，也通用使用了OpenGL图形硬件加速（所以图形部分应该性能相当），差异主要是虚拟化部分。不过，KVM经过优化性能应该差距不大。

当前(2017年底)Anbox还出于Pre-Alpha开发状态，所以不能保证所有功能正常。

目前官方只宣布支持Ubuntu发行版本，所以如果在Fedora系列运行可能困难重重。

根据[Anbox FAQ: Is there any relationship to Google's effort to bring Android applications to Chrome OS?](https://anbox.io/#collapse4)看，Anbox的原理和Google推进的Chrome OS for Android applications相似，都是通过将Android放到轻量级容器中运行，并使用一个网桥来和主机系统通讯。所不同的是，Anbox不允许直接访问硬件：例如，Anbox桥接了Open GL ES到host主机，而Chrome OS则可以访问host内核的图形子系统以允许更快的渲染。Anbox没有采用这个方案是为了能够提供不同系统的移植性。其他硬件设备，如WIFI或蓝牙，则抽象成独立的API提供给容器使用。

[Anbox FAQ: You say Anbox is convergent. Does it run on phones today?](https://anbox.io/#collapse7) 介绍了[UBports](https://ubports.com/)（Ubuntu Touch的后续开源项目，提供了在Nexus 5上运行Ubuntu Touch系统）和[LuneOS](http://webos-ports.org/wiki/Main_Page)（WebOS的后续开源项目，提供了在Nexux5上运行WebOS），都是很有趣的开源项目。

> 从前景来看，这个项目应该有比较好的发展，关注中...

# Shashlik（另一个开源项目）

[肉串Shashlik](http://www.shashlik.io/)是一个允许Linux用户安装和运行Android APKs到GNU/Linux发行版的软件工具集。Shashlik是通过一个剥离版本的Android，而不是使用模拟器运行，这样在用户会话中加载安装的Android应用程序。应用程序的图形渲染是通过系统的OpenGL来处理的，所以性能非常好。

在官方网站提供了[Ubuntu和AUR包](http://www.shashlik.io/download/)下载安装，但是这个项目目前没有活跃开发。

# 参考

* [How to install and run Android Apps (APKs) on Linux with Shashlik](https://www.howtoforge.com/tutorial/how-to-install-and-run-android-apk-on-linux-with-shashlik/)
* [Anbox](https://github.com/anbox/anbox)