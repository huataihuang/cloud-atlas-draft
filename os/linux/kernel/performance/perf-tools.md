

# 安装

* 在Ubuntu中安装perf工具是位于`linux-tools`软件包，不过需要针对内核进行安装：

```
apt-get install linux-tools-common linux-tools-generic linux-tools-`uname -r`
```

# 参考

* [perf-tools](https://github.com/brendangregg/perf-tools)