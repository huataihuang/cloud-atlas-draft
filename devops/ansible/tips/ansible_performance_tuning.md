# 关闭`fact`功能加快执行

默认情况下`ansible`会使用`facts`来检查目标服务器的环境变量，如果没有必要使用目标服务器的环境（如：网卡IP，主机名等），可以关闭这个功能，即设置

```bash
---
- hosts: all
  gather_facts: False
```

# 增加ansible并发

参考 [并发运行](http://www.kisops.com/?p=42)使用`async`和`poll`，前者触发并行运行`任务`（`task`），其值是任务的最大超时时间，后者表示检查任务是否完成的频率时间。这个方法对于一组任务之间没有顺序关系的话可以加快执行。也就是`task1`，`task2`。。。`taskN`之间没有顺序关系，则可以提高执行效率。

有以下的一些场景你是需要使用到ansible的polling特性的：

* 你有一个task需要运行很长的时间,这个task很可能会达到timeout.
* 你有一个任务需要在大量的机器上面运行
* 你有一个任务是不需要等待它完成的

注意：对于同一个任务， [Ansible: deploy on multiple hosts in the same time](http://stackoverflow.com/questions/21158689/ansible-deploy-on-multiple-hosts-in-the-same-time) 说明：Ansible默认是并发在所有主机执行一个任务，如果需要限制并发数量，需要使用`serial`参数，例如，每次执行一台服务器则设置 `serial:1`。例如，Ansible服务器压力过高，可以减少并发，例如限制100个并发。

# 参考

* [Ansible – disable gather facts](https://viewsby.wordpress.com/2014/11/25/ansible-disable-gather-facts/)
* [ANSIBLE PERFORMANCE TUNING (FOR FUN AND PROFIT)](https://www.ansible.com/blog/ansible-performance-tuning)