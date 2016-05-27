# 关闭`fact`功能加快执行

默认情况下`ansible`会使用`facts`来检查目标服务器的环境变量，如果没有必要使用目标服务器的环境（如：网卡IP，主机名等），可以关闭这个功能，即设置

```bash
---
- hosts: all
  gather_facts: False
```

# 增加ansible任务执行的并发

默认情况下，ansible执行恩每个任务的并发是5个并发，也就是同时只在5台目标服务器上执行同一个任务，对于很多大规模集群效率很低。ansible有一个`forks`参数可以设置每个任务的并发，在 `ansible.cfg` 中添加 `forks = 100` 可以使得每个任务的执行时并发达到100台主机

```bash
[defaults]
host_key_checking = False
forks = 100
```

# 增加ansible任务顺序的并发

参考 [并发运行](http://www.kisops.com/?p=42)使用`async`和`poll`，前者触发并行运行`任务`（`task`），其值是任务的最大超时时间，后者表示检查任务是否完成的频率时间。这个方法对于一组任务之间没有顺序关系的话可以加快执行。也就是`task1`，`task2`。。。`taskN`之间没有顺序关系，则可以提高执行效率。

有以下的一些场景你是需要使用到ansible的polling特性的：

* 你有一个task需要运行很长的时间,这个task很可能会达到timeout.
* 你有一个任务需要在大量的机器上面运行
* 你有一个任务是不需要等待它完成的

# 参考

* [Ansible – disable gather facts](https://viewsby.wordpress.com/2014/11/25/ansible-disable-gather-facts/)
* [ANSIBLE PERFORMANCE TUNING (FOR FUN AND PROFIT)](https://www.ansible.com/blog/ansible-performance-tuning)