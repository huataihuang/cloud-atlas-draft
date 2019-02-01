macOS中的sed语法和GNU sed不同，使用不习惯，也需要改脚本。所以通过brew安装GNU sed

```
brew install gnu-sed --with-default-names
```

安装以后需要根据提示加入路径，这样就可以默认使用GNU sed

```
PATH="/usr/local/opt/gnu-sed/libexec/gnubin:$PATH"
```

# 参考

* [How to use GNU sed on Mac OS X](https://stackoverflow.com/questions/30003570/how-to-use-gnu-sed-on-mac-os-x)