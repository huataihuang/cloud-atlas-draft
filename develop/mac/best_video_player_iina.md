说到macOS平台的最佳视频播放器，估计每个人都有自己的想法，就像最佳编程语言一样，有人认为是PHP，有人认为是Go。

OK，我们不争论。

我推荐使用视频播放器是 [IINA](https://iina.io) 原因如下（其实自嗨）：

* [开源](https://github.com/iina/iina) - 是的，你完全可以学习和研究现代macOS视频播放软件是如何开发的
* 专注macOS - 不是跨平台软件，而是只针对macOS平台优化的视频播放器：这可以说是缺点，但同时对于专注使用macOS平台但用户来说却是优点。程序不需要考虑跨平台兼容性，也就精简了代码
* 支持大量的视频格式 - 因为底层使用了支持大量视频格式的mpv引擎

# 安装

[IINA](https://iina.io)官网提供了直接安装的软件包。但是，作为开源软件，显然你可以自己编译安装。

# 编译

* IINA使用了 [cocoaPods](https://cocoapods.org/)来管理安装第三方库，可以通过以下方式安装

通过RubyGems安装CocoaPods:

```
sudo gem install cocoapods
```

或者通过Homebrew

```
brew install cocoapods
```

* 在IINA代码根目录下执行

```
pod install
```

## 使用预编译的库

* 在Xcode中打开 `iina.xcworkspace`
* Build项目

## 手工build mpv

你也可以不使用预先编译的库，而自己手工编译mpv库。

* 使用homebrew

使用iina的参数传递tap:

```
brew tap iina/homebrew-mpv-iina
brew install mpv-iina
```

* 使用MacPorts（如果不使用homebrew)

```
port install mpv +uchardet -bundle -rubberband configure.args="--enable-libmpv-shared --enable-lua --enable-libarchive --enable-libbluray --disable-swift --disable-rubberband"
```

* 将mpv头文件(*.h)复制到 `deps/include/mpv/` 目录

* 运行 `other/parse_doc.rb` 脚本将获取最新的mpv文档并生成 `MPVOption.swift`, `MPVCommand.swift` 和 `MPVProperty.swift` 。这对更新libmpv游泳

* 运行 `other/change_lib_dependencies.rb` ，该脚本部署依赖库到 `deps/lib` 目录

```
other/change_lib_dependencies.rb "$(brew --prefix)" "$(brew --prefix mpv-iina)/lib/libmpv.dylib"
```

如果使用 MacPorst，则换成执行

```
port contents mpv | grep '\.dylib$' | xargs other/change_lib_dependencies.rb /opt/local
```

* 在Xcoce中打开 `iina.xcworkspace` 

* 删除Frameworks组的所有引用的 .dylib 文件，并将所有 .dylib 文件移入 `deps/lib`
* 将所有 `deps/lib` 中的.dylib文件移入iina目标的"Embedded Binaries"部分
* 执行 Build 整个项目

> 编译iina的工作我没有实践，仅做记录