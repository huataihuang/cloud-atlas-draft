在[自制Nexus 5的Android ROM](../../../../develop/android/lineageos/build_lineageos_for_hammerhead)时，会遇到在Fedora 64位操作系统中运行32位程序的问题，解决的方法是安装32位库。

例如，通常需要获取32位glibc:

```
sudo dnf install glibc.i686
```

例如，如果需要运行32位gtk3程序，则运行：

```
sudo dnf install gtk3.i686
```

# 参考

* [What about 32bit program support on fedora 26 x86_64 installation?](https://ask.fedoraproject.org/en/question/108167/what-about-32bit-program-support-on-fedora-26-x86_64-installation/)