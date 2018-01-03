即使Linux老鸟也会对命令行众多参数以及各种非常用案例无法精确一一背出，虽然`man`给我们带来了手册，但是太过繁复和面面俱到的手册，有时候也会消耗太多的精力。

有没有最常用的案例手册，类似手头的速查小抄：有一个python开发的工具`cheat`提供了众多命令的速查手册。

这个`cheat`是采用Python开发的工具，需要通过`pip`安装。通常发行版已经安装了`pip`模块，所以只需要通过如下命令安装`cheat`

```python
sudo pip install cheat
```

使用方法类似`man`，只要`cheat XYZ`就可以查看和XYZ命令有关的使用方法。举例，查看`tar`命令使用方法：

```
cheat tar
```

查看可用的速查表

```
cheat -l
```

获取帮助

```
cheat -h
```

# 参考

* [Cheat ： 一个实用 Linux 命令示例集合](https://linux.cn/article-9193-1.html)