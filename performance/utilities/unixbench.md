

* 安装

```
yum install gcc gcc-c++ make libXext-devel

wget https://github.com/kdlucas/byte-unixbench/archive/v5.1.3.tar.gz

tar xf v5.1.3.tar.gz
cd byte-unixbench-5.1.3/UnixBench
make
```

* 运行

```
./Run
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