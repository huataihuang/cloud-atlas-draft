在使用[vim树形导航插件NERDtree](vim_nerdtree)时，启动vim总会提示：

```
The ycmd server SHUT DOWN (restart with ':YcmRestartServer'). YCM core library not detected; you need to compile YCM before using it. Follow the instructions in the documentation.
```

# Fedora安装YCM

在Fedora平台编译安装YouCompleteMe方法参考[YouCompleteMe A code-completion engine for Vim](https://valloric.github.io/YouCompleteMe/):

* 安装开发工具和CMake

```
sudo dnf install automake gcc gcc-c++ kernel-devel cmake
```

* 确保已经安装了Python头文件：

```
sudo dnf install python-devel python3-devel
```

* 安装LLVM Clang（如果不安装系统clang，则）:

```
sudo dnf install clang
```

* （可选）要支持各种开发语言，例如go, node.js ，则先安装对应工具

```
sudo dnf install golang
sudo dnf install nodejs
sudo dnf install ruby
```

> 详细请参考[Fedora环境下Go快速起步](../go/quick_startup_go_on_fedora)和[Fedora环境下Node.js快速起步](../nodejs/startup/quick_startup_nodejs_on_fedora)

* 编译安装所有检测到的语言（我没有使用这个方法）

```
cd ~/.vim/bundle/YouCompleteMe
./install.py --all
```

> 注意：这个命令会下载`CLang`（如果没有找到`libclang`）

如果只需要支持C语言（我没有使用这个方法）：

```
cd ~/.vim/bundle/YouCompleteMe
./install.py --clang-completer
```

多语言支持（使用这个方法，但是调整成使用系统libclang，见下文）

```
cd ~/.vim/bundle/YouCompleteMe
./install.py --clang-completer --go-completer --js-completer
```

这里遇到一个报错

```
Downloading Clang 5.0.0
CMake Error at ycm/CMakeLists.txt:102 (file):
  file DOWNLOAD HASH mismatch

    for file: [/home/huatai/.vim/bundle/YouCompleteMe/third_party/ycmd/cpp/../clang_archives/clang+llvm-5.0.0-linux-x86_64-ubuntu14.04.tar.xz]
      expected hash: [58c1171f326108cfb7641441c5ede7846d58823bce3206c86a84c7ef7748860d]
        actual hash: [e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855]
             status: [22;"HTTP response code said error"]



xz: (stdin): File format not recognized
tar: Child returned status 1
tar: Error is not recoverable: exiting now
CMake Error at ycm/CMakeLists.txt:135 (message):                                                                                   
  Cannot find path to libclang in prebuilt binaries
```

比较奇怪，我的系统是Fedora，却下载了ubuntu版本?后来发现实际上是官方网站CDN存在问题，导致下载文件大小为0.

不过，我不理解为何会下载ubuntu版本，`install.py`可传递参数中没有包含指定下载目录方法，单独指定安装目录可以参考[vim进阶 | 使用插件打造实用vim工作环境](https://www.jianshu.com/p/56385f4f95f5)手工[从LLVM官方下载](https://link.jianshu.com/?t=http://releases.llvm.org/download.html)二进制程序，或者[Boost your Vim autocompletion with YouCompleteMe and Jedi (on a CentOS system)](https://amnesiak.org/post/2013/05/30/getting-youcompleteme-to-run-on-centos/)

```
mkdir ~/tools
cd ~/tools
wget http://releases.llvm.org/5.0.1/clang+llvm-5.0.1-x86_64-linux-gnu-Fedora27.tar.xz

tar xf clang+llvm-5.0.1-x86_64-linux-gnu-Fedora27.tar.xz


mkdir ~/.vim/bundle/YouCompleteMe/ycm_build
cd ~/.vim/bundle/YouCompleteMe/ycm_build
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:~/tools/clang+llvm-5.0.1-x86_64-linux-gnu-Fedora27/lib
cmake28 -G "Unix Makefiles" \
        -DPATH_TO_LLVM_ROOT=~/tools/clang+llvm-5.0.1-x86_64-linux-gnu-Fedora27/ . ~/.vim/bundle/YouCompleteMe/cpp
make
```

当所有编译完成后，执行

```
cp ~/tools/clang+llvm-5.0.1-x86_64-linux-gnu-Fedora27/lib/libLLVM-*.so ~/.vim/bundle/YouCompleteMe/python
```

`不过，我为了简化安装，采用了系统自带的libclang库`，所以**实际采用的安装方法**是：

```
cd ~/.vim/bundle/YouCompleteMe
./install.py --system-libclang --clang-completer --go-completer --js-completer    
```

已验证，上述方法可行

编译安装后提示

```
[100%] Built target ycm_core
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN tern_runtime No repository field.
npm WARN tern_runtime No license field.

added 28 packages in 5.704s
```

# 参考

* [vim进阶 | 使用插件打造实用vim工作环境](https://www.jianshu.com/p/56385f4f95f5)
* [YouCompleteMe A code-completion engine for Vim](https://valloric.github.io/YouCompleteMe/)