作为云计算服务提供者，虚拟化存储I/O性能是非常关键的技术要素。

当用户从物理服务器迁移到云计算平台，用户最大的质疑有三项：

* 虚拟处理器性能
* 虚拟存储性能
* 虚拟网络性能

对于将数据库迁移到运上运行的客户，最大的疑虑是：`磁盘I/O`。

这是因为在现实中，数据库应用的最大瓶颈往往是磁盘。

作为云计算服务，如何帮助客户诊断磁盘I/O性能，是必不可少的基本能力。

本章节是学习MySQL磁盘I/O原理的笔记，希望有一天能够学以致用。

# 参考

* [How to fix MySQL high IOWait](https://bobcares.com/blog/fix-mysql-high-iowait/)
* [Diagnosing high disk utilization in MySQL](http://www.itworld.com/article/2695666/data-center/diagnosing-high-disk-utilization-in-mysql.html)
* [Optimizing InnoDB Disk I/O](https://dev.mysql.com/doc/refman/5.5/en/optimizing-innodb-diskio.html)
* [When does MySQL perform IO?](http://www.tocker.ca/2013/05/06/when-does-mysql-perform-io.html)
* [Monitoring MySQL IO Latency with performance_schema](http://www.markleith.co.uk/2011/05/23/monitoring-mysql-io-latency-with-performance_schema/)
* [MySQL 101: Monitor Disk I/O with pt-diskstats](https://www.percona.com/blog/2014/09/04/mysql-101-monitor-disk-io-with-pt-diskstats/)
* [Evaluating IO subsystem performance for MySQL Needs](https://www.percona.com/blog/2008/03/05/evaluating-io-subsystem-performance-for-mysql-needs/)