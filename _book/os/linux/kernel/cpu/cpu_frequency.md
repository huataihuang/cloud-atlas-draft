
# `x86_energy_perf_policy`

`x86_energy_perf_policy`工具允许管理员定义性能和节能相关的偏好。这个工具是在`kernel-tools`软件包提供的。

* 查看当前策略：

```
x86_energy_perf_policy -r
```

输出显示举例（这里显示的是`performance`策略）：

```
cpu0: 0x0000000000000000
cpu1: 0x0000000000000000
cpu2: 0x0000000000000000
...
cpu62: 0x0000000000000000
cpu63: 0x0000000000000000
```

* 设置新的策略，执行以下命令：

```
x86_energy_perf_policy profile_name
```

这里的`profile_name`可以是以下之一：

  * `performance` - 处理器将不会为了节能而牺牲性能。这个是默认策略。
  * `normal` - 处理器会为了明显的潜在节能效应而容许性能损失。这个设置对大多数服务器和桌面是合理的。
  * `powersave` - 处理器为了最大化节能而接受明显的性能降低。

* 对于三种不同的`x86_energy_perf_policy`，在使用`-r`检查输出分别如下：
  * `performance` = `0x0000000000000000`
  * `normal` = `0x0000000000000006`
  * `powersave` = `0x000000000000000f`

# `cpupower`


# 参考

* [Red Hat Enterprise Linux 7: Performance Tuning Guide - x86_energy_perf_policy](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Performance_Tuning_Guide/sect-Red_Hat_Enterprise_Linux-Performance_Tuning_Guide-Tool_Reference-x86_energy_perf_policy.html)
----
* [show Processor speed](http://stackoverflow.com/questions/5998703/show-processor-speed)
* [CPU frequency scaling in Linux](https://idebian.wordpress.com/2008/06/22/cpu-frequency-scaling-in-linux/)
* [Cpufreq](http://linux-sunxi.org/Cpufreq)
* [CPU frequency scaling](https://wiki.archlinux.org/index.php/CPU_frequency_scaling)
* [CPU frequency and voltage scaling code in the Linux kernel](https://www.kernel.org/doc/Documentation/cpu-freq/governors.txt)