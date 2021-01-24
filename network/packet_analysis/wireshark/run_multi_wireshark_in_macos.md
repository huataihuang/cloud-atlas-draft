我在macOS上运行wireshark来查看tcpdump抓到的服务器上的网络包，正好要对比两个不同的主机上数据包的差异。但是我发现，默认情况下macOS上只能运行一个wireshark，当我在Finder中打开第二个cap文件，结果就关闭了第一个cap文件窗口。

这让我的对比工作非常麻烦，不过，这个问题其实很好解决，就是在运行第二个wireshark时候，在终端中输入 `-n` 参数来运行就可以打开新的窗口：

```
open -n /Applications/Wireshark.app
```

# 参考

* [how to open multiple wireshark instances in Mac OS X](https://osqa-ask.wireshark.org/questions/50713/how-to-open-multiple-wireshark-instances-in-mac-os-x)