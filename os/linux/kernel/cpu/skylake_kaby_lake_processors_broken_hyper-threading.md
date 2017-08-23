根据 2017年6月25日Debian邮件列表 [[WARNING] Intel Skylake/Kaby Lake processors: broken hyper-threading](https://lists.debian.org/debian-devel/2017/06/msg00308.html)警告咨询，Intel Skylake/Kaby Lake处理器在开启超线程时存在bug，在某些情况下，出现危险的不可预知行为。

> 本文为综合技术资料，以及排查方法，并根据技术发展不断更新，以期能够在使用上述处理器环境中较好解决这个隐患。

* 检查处理器型号

```
grep name /proc/cpuinfo | sort -u
```

然后在Intel官方的 [Skylake](http://ark.intel.com/products/codename/37572/Skylake) 和 [Kaby Lake](http://ark.intel.com/products/codename/82879/Kaby-Lake) 产品页面核对是否属于受影响型号。

* 如果属于上述受影响型号，则检查是否开启了超线程：

```
grep -q '^flags.*[[:space:]]ht[[:space:]]' /proc/cpuinfo && echo "Hyper-threading is supported"
```

对于/proc/cpuinfo中显示处理器model是 78 或 94 ，stepping of 3，可以通过`intel-microcode`软件包版本3.20170511.1修复（2017.6.17）。

# 参考

* [[WARNING] Intel Skylake/Kaby Lake processors: broken hyper-threading](https://lists.debian.org/debian-devel/2017/06/msg00308.html)
* [Debian Linux reveals Intel Skylake and Kaby Lake processors have broken hyper-threading](http://www.zdnet.com/article/debian-linux-reveals-intel-skylake-kaby-lake-processors-have-broken-hyper-threading/)