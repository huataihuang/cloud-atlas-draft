LXQt平台默认的视频播放器是Dragon Player，不过，很多开源平台的视频播放器都需要安装对应的解码器才能播放非开源的视频格式，这款视频播放软件也不能播放mp4等视频。

大多数视频播放编码器默认都没有包含在官方Fedora软件仓库中，相关信息请参考 https://fedoraproject.org/wiki/Forbidden_items

解决方法是从Fluendo购买解码器，或者从RPMFusion安装。（有关授权我不是很清晰）

# 从RPM Fusion(Free & Non-Free)软件仓库安装

* 首先设置RPMFusion软件仓库

free

```
dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
```

nonfree

```
dnf install https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
```

或者同时安装free & nonfree

```
su -c 'dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm'
```

* 安装需要的编码器软件包（有350MB+） - 安装所有

如果使用的是GNOME环境则安装gstreamer系列

```
dnf install gstreamer1-{ffmpeg,libav,plugins-{good,ugly,bad{,-free,-nonfree}}} --setopt=strict=0
```

如果使用KDE，则可以安装xine来代替Gstreamer

```
dnf install xine-lib* k3b-extras-freeworld
```

如果你想通过rhythbox之类的网络收音流可安装

```
dnf install gstreamer1-{plugin-crystalhd,ffmpeg,plugins-{good,ugly,bad{,-free,-nonfree,-freeworld,-extras}{,-extras}}} libmpg123 lame-libs --setopt=strict=0
```

# Fedora 25及以上版本

对于Fedora 25及以上版本建议安装VLC player，这个播放器包含了绝大多数编码器

```
dnf install vlc
```

# 参考

* [What plugins do I need to install to watch movies and listen to music?](https://ask.fedoraproject.org/en/question/9111/sticky-what-plugins-do-i-need-to-install-to-watch-movies-and-listen-to-music/)