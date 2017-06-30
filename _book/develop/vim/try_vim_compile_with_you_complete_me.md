> 本文是尝试编译vim和YouCompleteMe插件的过程，比较折腾，但是不太成功。这里记录了一些尝试patch，获取补丁包等尝试，以备今后参考。实际最后安装方法还是参考 [Building Vim from source](https://github.com/Valloric/YouCompleteMe/wiki/Building-Vim-from-source) 来完成的。

在CentOS 7上，系统安装的vim版本是`7.4.160-1`，但是`:PluginInstall`安装时候提示`requires Vim 7.4.1578+`。可以参考 [The Vim repository at GitHub](The Vim repository at GitHub)从源代码编译安装，但是编译需要`requires Vim compiled with Python (2.6+ or 3.3+) support.`：

> 参考 [Report "YouCompleteMe unavailable: requires Vim compiled with Python 2.x support" error #1907](https://github.com/Valloric/YouCompleteMe/issues/1907)

```
yum install python-devel
yum install python34-devel

git clone https://github.com/vim/vim.git
cd src
./configure --enable-pythoninterp=yes --enable-python3interp=yes
make
sudo make install
```

这样安装完最新的vim 8.0之后，再次在vim中执行`:PluginInstall`即可成功。

> 当前在结合YouCompleteMe使用时发现vim 8会segment fault，所以回退到 7.4 最新版本

```
wget ftp://ftp.vim.org/pub/vim/unix/vim-7.4.tar.bz2
tar xfj vim-7.4.tar.bz2
cd vim-7.4

# 7.4 补丁包下载到 patchs 目录下 http://www.vim.org/patches.php

wget -m ftp://ftp.vim.org/pub/vim/patches/7.4/
mv ftp.vim.org/pub/vim/patches ./

# 完成补丁
for i in patches/7.4/7.4.{1..2367}; do patch -p0 < $i >& vim_patches.log; done

# 编译
cd ..
./configure --enable-pythoninterp=yes --enable-python3interp=yes
make -j24
sudo make install
```

> 奇怪，还是存在报错，显示不支持python并且版本没有超过`7.4.1578+`，检查vim显示版本依然是`7.4`

检查 `vim_patches.log` 内容有

```
      1 patching file src/testdir/runtest.vim
      2 can't find file to patch at input line 37
      3 Perhaps you used the wrong -p or --strip option?
      4 The text leading up to this was:
      5 --------------------------
      6 |*** ../vim-7.4.2366/src/version.c      2016-09-12 13:18:19.775958670 +0200
      7 |--- src/version.c      2016-09-12 13:30:34.221861015 +0200
      8 --------------------------
      9 File to patch:
     10 Skip this patch? [y]
     11 Skipping patch.
     12 1 out of 1 hunk ignored
```

手工完成补丁 `patch -p1 < patches/7.4/7.4.2366` ，这个补丁方法似乎有不少失败。准备还是采用完整的代码重新编译安装。

参考 [Download a specific tag with Git](https://stackoverflow.com/questions/791959/download-a-specific-tag-with-git) 原来我们可以先列出所有git库中的tag版本，然后指定下载

```
git tag -l
git checkout tags/<tag_name> -b <branch_name>
```

可以看到`v7.4.2367`

所以我们提取这个指定版本

```
git checkout tags/v7.4.2367 -b v7.4.2367
```

在获得了指定版本的源代码后再次编译

```
cd src
./configure --enable-pythoninterp=yes --enable-python3interp=yes
make
sudo make install
```

* `ycm`需要手工编译出库文件

> YouCompleteMe提供了一个 [Building Vim from source](https://github.com/Valloric/YouCompleteMe/wiki/Building-Vim-from-source) 完整介绍了在Ubuntu 16.04上从源代码编译vim的方法，可以参考。

```
cd ~/.vim/bundle/YouCompleteMe
./install.py
```

> 编译`ycm`需要系统中先安装cmake，并且要求编译器支持C++11。这在CentOS7上编译会存在报错

```
CMake Error at CMakeLists.txt:180 (message):
  Your C++ compiler does NOT fully support C++11.
```

解决的方法参考 [Your C++ compiler does NOT support C++11. #2596](https://github.com/Valloric/YouCompleteMe/issues/2596)，即先安装最新版本的gcc 5.2

```
wget http://gcc.parentingamerica.com/releases/gcc-7.1.0/gcc-7.1.0.tar.bz2
tar xfj gcc-7.1.0.tar.bz2
cd gcc-7.1.0
./contrib/download_prerequisites
cd ..
mkdir objdir
cd objdir
$PWD/../gcc-7.1.0/configure --prefix=$HOME/gcc-7.1.0 --enable-languages=c,c++ --disable-multilib
make -j24
make install
```

> `make`使用参数`j24`是因为主机有12个cpu core，设置make并发编译。
>
> 24核56G虚拟机编译gcc-7.2.1耗时：

```
real	31m14.933s
user	323m42.384s
sys	16m41.146s
```

最初`configure`没有使用`--disable-multilib`，即

```
$PWD/../gcc-7.1.0/configure --prefix=$HOME/gcc-7.1.0 --enable-languages=c,c++
```

报错如下：

```
checking for objdir... .libs
configure: WARNING: using in-tree isl, disabling version check
*** This configuration is not supported in the following subdirectories:
     gnattools gotools target-libada target-libhsail-rt target-libgfortran target-libbacktrace target-libgo target-libffi target-libobjc target-liboffloadmic
    (Any other directories should still work fine.)
checking for default BUILD_CONFIG... bootstrap-debug
checking for --enable-vtable-verify... no
/usr/bin/ld: cannot find crt1.o: No such file or directory
/usr/bin/ld: cannot find crti.o: No such file or directory
/usr/bin/ld: skipping incompatible /usr/lib/gcc/x86_64-redhat-linux/4.8.5/libgcc_s.so when searching for -lgcc_s
/usr/bin/ld: cannot find -lgcc_s
/usr/bin/ld: cannot find -lc
/usr/bin/ld: skipping incompatible /usr/lib/gcc/x86_64-redhat-linux/4.8.5/libgcc_s.so when searching for -lgcc_s
/usr/bin/ld: cannot find -lgcc_s
/usr/bin/ld: cannot find crtn.o: No such file or directory
collect2: error: ld returned 1 exit status
configure: error: I suspect your system does not have 32-bit development libraries (libc and headers). If you have them, rerun configure with --enable-multilib. If you do not have them, and want to build a 64-bit-only compiler, rerun configure with --disable-multilib.
```

检查了操作系统，实际系统在`/usr/lib64`目录下有 `crt1.o` 和 `crtn.o`，所以按照提示，纯64位系统，使用`--disable-multilib`参数

```
$PWD/../gcc-7.1.0/configure --prefix=$HOME/gcc-7.1.0 --enable-languages=c,c++ --disable-multilib
```

然后使用如下方法编译YCM

```
cd ~/.vim/bundle/YouCompleteMe
CXX=~/gcc-7.1.0/bin/c++ ./install.py
```

> `macOS`需要先安装[cmake](https://cmake.org/install/)才能编译，如果通过`.dmg`包安装二进制软件包，则需要编辑`~/.bash_profile`添加`export PATH=/Applications/CMake.app/Contents/bin:$PATH`，并执行`. ~/.bash_profile`使环境生效后才能执行上述编译。
>
> `YouCompleteMe`模块要求`Vim 7.3.598+`以上版本，Mac OS X 10.11自带的vim版本较低，测试使用`brew`安装的`vim`版本会导致python线程crash，所以不推荐。在macOS 10.12 beta版本上测试验证正常。