

# 安装snapd

```
sudo dnf install snapd
sudo ln -s /var/lib/snapd/snap /snap
```

在`~/.bash_profile`中添加

```bash
PATH=$PATH:/snap/bin
export PATH
```

然后重新登陆或者执行`. ~/.bash_profile`

# 安装Anbox

Anbox安装过程当前包含了几个步骤用于在host主机系统增加附加组件，步骤包括：

* 为binder和ashmem添加不在内核主干的模块，因为当前还没有哪个发行版的内核包含了这两个模块
* 设置`/dev/binder`和`/dev/ashmem`的udev规则
* 一个在用户会话中用来启动Anbox会话的管理器

为了使得步骤更为简易，Anbox提供了一个在[snap](https://snapcraft.io/)构建的`anbox-installer`，这个installer将执行所有必要步骤

```
snap install --classic anbox-installer
```

上述步骤完成后，在 `/sanp/bin/` 目录下有一个`anbox-installer`软链接到`/usr/bin/snap`

* 启动安装

```
anbox-installer
```

这里提示报错`execv failed: No such file or directory`

这个问题在 [Can't Install. Fedora 25. #85](https://github.com/anbox/anbox/issues/85) 讨论过，目前尚未有好的解决方法。似乎当前 Anbox 只支持 ubuntu 发行版本。[Bug 1455411 - Anbox on Fedora](https://bugzilla.redhat.com/show_bug.cgi?id=1455411) 大论了如何在fedora中完成ashmem和binder内核模块的dkms包。

在[Fix Snap Error: cannot change profile for the next exec call: No such file or directory](https://itsfoss.com/fix-snap-error/)提出了解决snap包安装的方法：因为snap是通过Ubuntu提供的，高度依赖Ubuntu，不能够支持所有（主要是较新的）Linux内核。只有通过Ubuntu提供的Linux内核才能保证Snap正常工作。该文档建议安装Ubuntu发行版提供的Linux内核来修复这个问题。

> 有关在Fedora中部署Anbox待解决

# 参考


* [Install snapd on Fedora](https://docs.snapcraft.io/core/install-fedora?_ga=2.82458641.649910660.1514191299-2004359686.1514191299)
* [Fedora 28: cannot install "anbox-installer": classic confinement is not yet supported #427](https://github.com/anbox/anbox/issues/427)