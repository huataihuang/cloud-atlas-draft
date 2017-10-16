在MacOS中，如果要将文件复制到剪贴板，在终端中可以执行：

```bash
cat ~/Desktop/example.txt | pbcopy
```

然后就可以复制到其他位置：

```bash
pbpaste > ~/Documents/example.txt
```

# 参考

* [using terminal to copy a file to clipboard](https://apple.stackexchange.com/questions/15318/using-terminal-to-copy-a-file-to-clipboard)