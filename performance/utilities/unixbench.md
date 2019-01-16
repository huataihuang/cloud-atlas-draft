[UnixBench](https://github.com/kdlucas/byte-unixbench)始于BYTE UNIX benchmark suite，多年以来由很多人更新和修改，提供了对Unix系统对基本性能度量，用于对比不同系统对性能。

UnixBench测试也包含了一些非常简单对徒刑测试，并且能够针对多处理器复制足够的副本进行多处理器性能压测。即首先运行一个单任务测试单个CPU性能，然后按照系统的处理器数量调用相应的多任务并发测试。

* 安装

```
yum install gcc gcc-c++ make libXext-devel

wget https://github.com/kdlucas/byte-unixbench/archive/v5.1.3.tar.gz

tar xf v5.1.3.tar.gz
cd byte-unixbench-5.1.3/UnixBench
make
```

> 对于Debian/Ubuntu，则使用如下命令安装依赖编译库软件包：

```
sudo apt-get install libx11-dev libgl1-mesa-dev libxext-dev perl perl-modules make git
```

* 运行

```
./Run
```

如果要测试限制指定cpu数量，例如2个cpu

```
./Run -c 2
```

如果只测试部分测试案例，可以以参数传递测试用例：

```
./Run dhry2reg whetstone-double syscall pipe context1 spawn execl shell1 shell8 shell16
```

* 如果要不断循环测试，请参考 [使用nohup执行while循环](../../develop/shell/bash/nohup_while_loop)

```bash
nohup sh -c 'while true;do ./Run;done' &
```

# 排错

在CentOS 6.9上编译后执行会提示错误：

```
Can't locate Time/HiRes.pm in @INC (@INC contains: /usr/local/lib64/perl5 /usr/local/share/perl5 /usr/lib64/perl5/vendor_perl /usr/share/perl5/vendor_perl /usr/lib64/perl5 /usr/share/perl5 .) at ./Run line 6.
BEGIN failed--compilation aborted at ./Run line 6.
```

参考 [Can’t locate Time/HiRes.pm Perl](https://drewsymo.com/2016/05/09/cant-locate-timehires-pm-perl/) 和 [Perl-Can't locate Time/HiRes.pm 错误](http://blog.51cto.com/perlin/1192035):

```
yum install perl-Time-HiRes
```

# 参考

* [Install and Run UnixBench on CentOS or Debian VPS](https://my.vps6.net/knowledgebase/1/Install-and-Run-UnixBench-on-CentOS-or-Debian-VPS.html)
* [How to benchmark a linux server using UnixBench](https://www.copahost.com/blog/benchmark-linux-unixbench/)