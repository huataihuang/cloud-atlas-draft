从Linux 4.5内核开始cgroup v2接口已经被标记为官方发布，意味着不再使用devel标签并且可以作为新型cgroup2 fs类型来挂载。有关 Cgroup v2接口的更改，参考 [cgroup v2](https://events.linuxfoundation.org/sites/events/files/slides/2014-KLF.pdf)这个slide。

在YouTube上有一个[NYLUG Presents: Tejun Heo on cgroups and cgroups v2 (Feb 18th, 2015) ](https://www.youtube.com/watch?v=PzpG40WiEfM)视频，是Cgroup V2开发者Tejun Heo的演讲。(10:45)



# 参考

* [Cgroup v2 Is To Be Made Official With Linux 4.5](https://www.phoronix.com/scan.php?page=news_item&px=Cgroup-V2-Linux-4.5)
* [Cgroup V2 and writeback support](http://hustcat.github.io/cgroup-v2-and-writeback-support/)是一篇比较好的介绍Cgroup V2 writeback支持特性的中文博客。
* [State of CPU controller in cgroup v2](https://lwn.net/Articles/697369/) 介绍了在cgroup v2中如何实现
* [Understanding the new control groups API](https://lwn.net/Articles/679786/) 介绍cgroup v2的新特性