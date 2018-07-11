# SPEC 2006介绍

SPEC CPU 2006 benchmark是SPEC新一代的行业标准化的CPU测试基准套件。重点测试系统的处理器，内存子系统和编译器。这个基准测试套件包括的SPECint基准和SPECfp基准。 其中SPECint2006基准包含12个不同的基准测试和SPECfp2006年基准包含19个不同的基准测试。SPEC设计了这个套件提供了一个比较标准的计算密集型，高性能的跨硬件的CPU测试工具。在SPEC CPU 2006基准有几种不同的方法来衡量计算机性能。 一种方式是测量计算机完成单一任务的速度; 另一种方式吞吐量，容量或速率的测量。 

> 当前spec cpu 2006可以免费获得，最新版本spec cpu 2017需要购买。

# 工具获取

# 工具安装

* 标准安装

```
$mount -t iso9660 -o ro,exec /dev/cdrom /mnt
$cd /mnt
$./install.sh
```

* 可以指定安装目录如：

```
$./install.sh -d  /home/cpu2006
```

# 测试



# 参考

* [Spec2006使用说明](http://www.vimlinux.com/lipeng/2014/10/10/linux/)
* [SPEC benchmark 测试程序使用教程](https://blog.csdn.net/timesir/article/details/78157791)