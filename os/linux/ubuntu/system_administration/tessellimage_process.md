今天发现在Jetson Nano的L4T操作系统(Ubuntu 18.04 LTS)上有进程：

```
Tasks: 265 total,   2 running, 263 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.9 us,  1.4 sy, 22.6 ni, 74.9 id,  0.0 wa,  0.1 hi,  0.1 si,  0.0 st
KiB Mem :  4051104 total,  1642552 free,   969532 used,  1439020 buff/cache
KiB Swap:  2025536 total,  2025536 free,        0 used.  3093964 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
12162 huatai    30  10   48776  46748   3064 R  90.5  1.2   8:49.45 tessellimage -root
```

这个 tessellimage 是 使用 Delaunay tessellation(镶嵌小块)转换图像，这个工具实际上是屏保程序执行操作，将一个图形转换成三角形拼块。看起来比较炫酷的一种动态屏保，不过也比较消耗系统资源。

> 我有洁癖，对于无用的消耗性能的软件比较在意，所以我关闭了屏保，节约资源。不过，这个开源程序也是学习图形处理的方式。

# 参考

* [tessellimage - Converts an image to triangles using Delaunay tessellation.](http://manpages.ubuntu.com/manpages/bionic/man6/tessellimage.6x.html)