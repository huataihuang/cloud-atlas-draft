Intel 处理器 SkyLake系列开始，引入了4个处理器分类：

 * Platinum: 81XX
 * Gold: 61XX & 51XX
 * Silver: 41XX
 * Bronze: 31XX

新的系列也称为 Intel Xen Scalable Processors ，针对不同的规模从入门级的 Bronze（青铜）到最高级别的Platinum（铂金）

如何区分Intel SkyLake系列处理器？

> 以下方法待验证

从 `/proc/cpuinfo` 读取的CPU信息，观察 `model name` 行，如 `Intel(R) Xeon(R) Platinum 8163 CPU @ 2.50GHz` 和 `Intel(R) Xeon(R) Gold 6149 CPU @ 3.10GHz` 都属于SkyLake系列，对应共通的参数行

```
cpu family	: 6
model		: 85
stepping	: 4
```

所以采用如下命令检查

```
cat /proc/cpuinfo | grep -e "cpu family" -e "model" -e "stepping" | grep -v "model name" | sort -u | awk '{print $NF}' | xargs -n 3
```

输出内容是

```
6 85 4
```

则判断为Sky Lake系列处理器。类似，BroadWell处理器输出内容则是`6 79 1`。

# 参考

* [Introducing the Intel® Xeon® Processor Scalable Family](https://www.siliconmechanics.com/i78151/intel-xeon-processor-scalable-family?gclid=CjwKCAjwtdbLBRALEiwAm8pA5SGsria2lE0NZ9PChO7BnSrqSWAi3Wlf_86bVhOjUcpH5uxaFnP-7hoCS4kQAvD_BwE)
* [Intel Unveils the Xeon Scalable Processor Family: Skylake-SP in Bronze, Silver, Gold and Platinum](http://www.anandtech.com/show/11332/intel-unveils-the-xeon-scalable-processor-family-skylakesp-in-bronze-silver-gold-and-platinum)