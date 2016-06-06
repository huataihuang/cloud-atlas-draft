# `make.conf`配置

以下是MacBook Air 11寸 2011版本笔记本的`/etc/portage/make.conf`配置

```bash
CFLAGS="-march=native -O2 -pipe"
CXXFLAGS="${CFLAGS}"
CHOST="x86_64-pc-linux-gnu"

MAKEOPTS="-j3"

FEATURES="parallel-fetch"
FEATURES="ccache parallel-fetch"
CCACHE_SIZE="4G"

#USE="-ipv6 -fortran -qt3 -arts -gnome -cups threads icu qt5 kde dbus hal X mmx mmxext sse sse2 ssse3 png xcb jpeg opengl dri sna udev alsa"

# KDE
#USE="-ipv6 -fortran -qt3 -qt4 -arts -gnome -cups -multilib -X qt5 dbus wayland threads mmx mmxext sse sse2 ssse3 png xcb jpeg opengl dri sna udev alsa"

# Gnome
USE="-fortran -qt3 -qt4 -qt5 -arts -cups -multilib -wayland icu minizip X dbus systemd udisks gtk3 gnome threads mmx mmxext sse sse2 ssse3 png xcb jpeg dri sna alsa networkmanager opengl egl policykit pulseaudio"
# x11-wm/awesome need png xcb
# Intel Video recommand "opengl dri sna udev"

CONFIG_PROTECT="-*"
ACCEPT_KEYWORDS="~amd64"


PORTDIR="/usr/portage"
DISTDIR="${PORTDIR}/distfiles"
PKGDIR="${PORTDIR}/packages"

GENTOO_MIRRORS="http://mirrors.163.com/gentoo/ http://mirrors.xmu.edu.cn/gentoo http://ftp.lecl.net/pub/gentoo/"

#INPUT_DEVICES="evdev synaptics"
#VIDEO_CARDS="intel i965"
VIDEO_CARDS="nvidia"
```

> [MAKEOPTS](https://wiki.gentoo.org/wiki/MAKEOPTS)表示编译时候并发任务，建议是cpu核数+1

> [GCC optimization](https://wiki.gentoo.org/wiki/GCC_optimization)涉及优化参数

> [ACCEPT_KEYWORDS](https://wiki.gentoo.org/wiki/ACCEPT_KEYWORDS/zh-cn) 默认值即系统架构本身 － 在此情况下，包管理器只接受那些KEYWORDS 变量包含此架构的 ebuild。如果用户希望能够安装那些还未被认为适合生产环境使用的 ebuild，可以在架构前添加 `~` 前缀。

更新Portage树到最新版本

```bash
emerge --sync
```

重新编译系统，升级系统

```bash
emerge -avtuDN world
```

升级后执行

```bash
emerge --update --newuse --deep @world
```

再执行一次清理不需要的软件包

```bash
emerge --depclean    
```

有可能是用某些库文件的软件包需要在world update之后重新编译：

> Use `emerge @preserved-rebuild` to rebuild packages using these libraries
>
> * After world updates, it is import to remove obsolete packages with emerge --depclean. Refer to `man emerge` for more information.

> 这里是用了`ccache`功能，所以建议先`emerge ccache`，这样软件包编译可以在本地缓存，重复编译可以大大加快。