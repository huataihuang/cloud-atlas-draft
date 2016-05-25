由于KDE桌面比较沉重，所以转换到轻量级的Xfce桌面。

> 实践验证Idea Jetbrains开发IDE可以在Xfce环境使用（虽然官方只说明支持Gnome和KDE）

# 卸载KDE

参考 [KDE/Removal](https://wiki.gentoo.org/wiki/KDE/Removal)来删除KDE

```bash
emerge --ask --depclean kde-base/kdelibs $(qlist -IC 'kde-base/*') $(for name in $(qlist -IC | grep -v '^kde-base/') ; do ( qdepends -C $name | grep -q kdelibs ) && echo $name ; done)

emerge --unmerge kde-plasma/plasma-desktop
emerge --unmerge kde-plasma/plasma-meta
emerge --unmerge @kde-frameworks
```

删除 overlay

```bash
layman --del kde
```

清理掉不需要的依赖qt的输入法(根据`emerge --update --deep --newuse world`输出提示)

```bash
emerge --unmerge app-i18n/fcitx-qt5 app-i18n/fcitx
emerge --unmerge dev-qt/qt-meta dev-qt/qtopengl
emerge --unmerge kde-base/kdelibs kde-apps/khelpcenter
emerge --unmerge kde-apps/konsole kde-apps/dolphin kde-apps/kate kde-base/kactivities dev-qt/qtdeclarative calligra goldendict kdevelop-live
emerge --unmerge kde-apps/kdeadmin-meta kde-apps/kdeartwork-meta kde-apps/kdesdk-meta kde-plasma/powerdevil sys-power/upower-pm-utils
```

# 修改`make.conf`

```bash
CFLAGS="-march=native -O2 -pipe"
CXXFLAGS="${CFLAGS}"
CHOST="x86_64-pc-linux-gnu"

MAKEOPTS="-j5"

FEATURES="parallel-fetch"
FEATURES="ccache parallel-fetch"
CCACHE_SIZE="16G"

#USE="-ipv6 -fortran -qt3 -qt4 -arts -gnome -cups -multilib -X qt5 dbus wayland threads mmx mmxext sse sse2 ssse3 png xcb jpeg opengl dri sna udev alsa"
USE="-ipv6 -fortran -arts -gnome -cups -qt3 -qt4 -qt5 -kde threads icu dbus hal X mmx mmxext sse sse2 ssse3 png xcb jpeg opengl dri sna udev alsa"
# x11-wm/awesome need png xcb
# Intel Video recommand "opengl dri sna udev"

CONFIG_PROTECT="-*"
ACCEPT_KEYWORDS="~amd64"


PORTDIR="/usr/portage"
DISTDIR="${PORTDIR}/distfiles"
PKGDIR="${PORTDIR}/packages"

GENTOO_MIRRORS="http://mirrors.163.com/gentoo/ http://mirrors.xmu.edu.cn/gentoo http://ftp.lecl.net/pub/gentoo/"

INPUT_DEVICES="evdev synaptics"
VIDEO_CARDS="intel i965"
```


* 执行以下步骤重新编译系统

```bash
emerge --update --deep --newuse world
```

* 清理已经解决的没有任何包依赖的库文件

```bash
emerge --update --deep --newuse --with-bdeps=y @world
emerge --depclean
revdep-rebuild
```

> `revdep-rebuild`需要安装`Gentoolkit`

* 重新编译整个系统

```bash
emerge -avtuDN world
```