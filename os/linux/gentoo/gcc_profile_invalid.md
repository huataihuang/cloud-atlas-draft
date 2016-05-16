一次升级`emerge -avtuDN world`，似乎因为我在`/etc/portage/make.conf`中添加了`qt4 kde`，引起大量的软件包重新编译。但是编译出错，我看到提示有做了 `world` 以后建议`emerge --depclean`，就依样画葫芦做了这个命令。但是发现系统清理了一些软件包后，再次`emerge -avtuDN world`出现如下提示

```bash
* gcc-config: Active gcc profile is invalid!
gcc-config: error: could not run/locate 'x86_64-pc-linux-gnu-cpp'
```

此时使用命令 `gcc-config -l`显示输出

```bash
* gcc-config: Active gcc profile is invalid!
[1] x86_64-pc-linux-gnu-4.9.3
```

原来是因为我前面使用了 `emerge --depclean` 结果卸载了旧版本的 `sys-devel/gcc-4.8.5` 导致了`gcc-config`没有切换到新版本。

参考[gcc-config: Active gcc profile is invalid!](https://archives.gentoo.org/gentoo-user/message/9f193b36813b8b5b83faf5bd0cbcfff4)，很简单，就是使用命令

```bash
gcc-config 1
```

将指向切换到新版本就可以。

# 参考

* [How to update a GCC profile on Gentoo](http://www.xaprb.com/blog/2006/06/07/how-to-update-a-gcc-profile-on-gentoo/)
* [gcc-config: Active gcc profile is invalid!](https://forums.gentoo.org/viewtopic-t-755720-start-0.html)
