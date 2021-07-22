在macOS上使用 `sed -i` 命令修订文件会出现报错

```bash
sed: 1: "app_list": command a expects \ followed by text
```

在macOS上使用 `-i` 参数需要提供一个备份文件的扩展名，并使用 `-e` 修订文件:

```bash
sed -i'.original' -e 's/old_link/new_link/g' File1.txt
```

则被修改的文件 `File1.txt` ，会生成一个 `File1.txt.original` 的备份文件，并且原文件 `File1.txt` 就修订好了。不过，这个 `-i -e` 参数需要OS X 10.9+以上版本，早期OS X版本不支持。并且，这个参数组合在Linux上也不能工作。

比较简单的方法还是在macOS上安装GNU sed工具来（通过homebrew):

```bash
brew install gnu-sed
```

然后使用命令  `/usr/local/bin/gsed` 来处理。

# 参考

* [sed command with -i option failing on Mac, but works on Linux](https://stackoverflow.com/questions/4247068/sed-command-with-i-option-failing-on-mac-but-works-on-linux)