python守护进程实现原理：

* 首先守护进程必须将自己与父进程分离开，所以在第一个 `os.fork()`操作完成后立即终结父进程
* 当子进程成为孤儿以后，就调用`os.setsid()`创建一个全新的进程会话，并将子进程设为会话的头领，也就是子进程设置为新的进程组的头领进程，并确保没有任何与之关联的控制终端。

# 参考

 * [Python Cookbook：在UNIX上加载守护进程](https://www.amazon.cn/Python-Cookbook-中文版-美-大卫·比斯利-布莱恩·K-琼斯-著/dp/B01N3T8KQS/ref=pd_sim_351_1?ie=UTF8&psc=1&refRID=Q3FTP4P4GWBXYVF96TWB)