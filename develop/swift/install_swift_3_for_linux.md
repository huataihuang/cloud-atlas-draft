[Swift官方下载网站](https://swift.org/download/#releases)提供了Ubuntu版本的Swift，可以直接下载安装。

> [Install Swift language on CentOS (Red Hat)](http://stackoverflow.com/questions/34073701/install-swift-language-on-centos-red-hat)介绍了Swift 3.0 Preview 6 for Ubuntu 14.04 也可以在CentOS x64 7.2上工作，只需要创建软连接

```
sudo ln -s /lib64/libedit.so.0 /lib64/libedit.so.2
sudo ln -s /usr/lib64/libicuuc.so /usr/lib64/libicuuc.so.52
sudo ln -s /usr/lib64/libicui18n.so /usr/lib64/libicui18n.so.52
```

# 在Ubuntu 16上安装Swift 3

* 安装swfit之间需要先安装`clang`并配置：

```
sudo apt-get update
sudo apt-get install clang

sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.8 100
sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.8 100
```

> 当前（2017.5）默认安装`clang-3.8`版本，可以通过`apt-cache search clang`搜索相关软件包信息。

> 注意不要忘记执行`update-alternatives`，否则会导致build软件包的时候出现`error: invalid inferred toolchain`报错。

> `update-alternatives` 语法命令 `--install <link> <name> <path> <priority>`

* 下载swift软件包 https://swift.org/download/ ，将软件包解压缩到 `/opt`目录下（也可以是任意目录）

```
wget https://swift.org/builds/swift-3.1.1-release/ubuntu1610/swift-3.1.1-RELEASE/swift-3.1.1-RELEASE-ubuntu16.10.tar.gz
tar xfz swift-3.1.1-RELEASE-ubuntu16.10.tar.gz
```

```
cd /opt
sudo mkdir swift
cd swift
sudo cp -R ~/swift-3.1.1-RELEASE-ubuntu16.10.tar.gz ./
sudo tar -zxvf swift-3.1.1-RELEASE-ubuntu16.10.tar.gz
sudo ln -s /opt/swift/swift-3.1.1-RELEASE-ubuntu16.10 /opt/swift/swift-current
```

> 以上安装，所有swift版本都安装在`/opt/swift`目录下，并且当前使用版本软连接为`swift-current`

* 将swift加入PATH，即编辑`~/.bash_profile`添加

```
PATH=/opt/swift/swift-current/usr/bin:$PATH
```

> 注意：如果shell使用bash的话，不要将上述环境设置添加到`~/.profile`中，因为bash不读取这个环境配置（见配置前半部分注释）。

重新登录终端，或者执行`. ~/.profile`

执行以下命令验证安装是否成功

```
swift -version
```

# swift初次使用

* 执行`swift`报错

```
/opt/swift/swift-3.1.1-RELEASE-ubuntu16.10/usr/bin/lldb: error while loading shared libraries: libpython2.7.so.1.0: cannot open shared object file: No such file or directory
```

参考 [Incomplete install instructions for Ubuntu](https://bugs.swift.org/browse/SR-2743)

```
sudo apt-get install libpython2.7
```

> 此外[Incomplete install instructions for Ubuntu](https://bugs.swift.org/browse/SR-2743)还建议安装`sudo apt-get install libcurl3`

* 执行`print("Hello, world!")`报错

```
error: Couldn't IRGen expression, no additional error
```

> 这个错误在Mac OS X上默认安装并没有出现错误，但是在ubuntu linux 16.10上出现，是环境相关错误。

尝试将上述测试命令`print("Hello, world!")`写入到一个`hello.swift`文本中，然后执行`swift hello.swift`发现提示无法读取`swift`语言安装目录中文件：

```
<unknown>:0: error: cannot open file '/opt/swift/swift-3.1.1-RELEASE-ubuntu16.10/usr/lib/swift/CoreFoundation/module.modulemap': Permission denied
```

检查发现这个文件的权限是`-rw-r----- 1 root root`

原来程序包安装目录中有文件对于普通用户无法访问导致了上述问题。将`swift`程序包软件目录修改成普通用户属主：

```
cd /opt
chown -R hautai:huatai swift
```

然后再使用`swift`程序就没有问题了。

# CentOS 7上源代码编译Swift 3

> 参考 [Trying to Build Swift on CentOS 7.1 from Source](http://www.swiftprogrammer.info/swift_centos_1.html)，有可能可以从源代码编译。

# 参考

* 『Mastering Swift 3 - Linux』
* [Swift: Getting Started](https://swift.org/getting-started/#installing-swift)