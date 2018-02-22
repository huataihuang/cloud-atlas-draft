Fedora　Workstation spin默认桌面是GNOME 3，但是可以轻而易举地切换到其他桌面，包括KDE, XFCE 或　MATE。

* 首先使用`dnf`检查完整的桌面环境名字：

```
dnf grouplist -v
```

注意：在环境前面需要加一个`@`，例如安装Xfce桌面：

```
sudo dnf install @xfce-desktop-environment
```

# 参考

* [Switching Desktop Environments](https://fedoraproject.org/wiki/Switching_Desktop_Environments)
* [fedora WIKI: Xfce](https://fedoraproject.org/wiki/Xfce)