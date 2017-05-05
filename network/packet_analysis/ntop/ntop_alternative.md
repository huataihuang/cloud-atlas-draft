# ntop的开源替代产品

[As ntop is now useless, what are the alternatives?](http://www.linuxquestions.org/questions/linux-software-2/as-ntop-is-now-useless-what-are-the-alternatives-4175471001/) 讨论了一些ntop的替代产品，其中开源软件部分实现：

* [nethogs](https://github.com/raboof/nethogs)

nethogs是基于`/proc`实现`针对进程统计带宽`的'net top'工具（也支持通过libcap的抓包模式），对于特定网络环境分析非常有用。

注意使用最新版本以确保准确监控和性能。

* 

# 思考

ntop通过sniffer的抓包方式进行流量分析，虽然非常精确，但是带来极大的系统开销，对于高负载和高网络流量的环境会有比较大的局限性。估计需要配合特定的硬件以及闭源驱动来实现真实环境的监控分析。



# 参考

* [As ntop is now useless, what are the alternatives?](http://www.linuxquestions.org/questions/linux-software-2/as-ntop-is-now-useless-what-are-the-alternatives-4175471001/)