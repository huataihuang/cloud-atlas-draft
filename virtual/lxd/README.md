LXD是[Canonical](http://www.canonical.com/)(也就是[Ubuntu](https://www.ubuntu.com/)背后的开源技术公司，类似于Red Hat)推出的基于LXC容器技术的系统容器管理器。实际上就是对标[Docker](https://www.docker.com/)的容器管理技术。

> 个人理解：

* 容器技术底层是namespace, cgroup 以及 overlay文件系统；
* 中间层是容器的管理器，当前主流是Docker(最初基于LXC，现在已独立实现对底层的管理)。可选的有LXD（基于LXC）
* 上层是容器调度，当前主流是Kubernetes。可选的有Mesos和Swarm

容器技术发展风云变换，掌握越底层的技术，越能掌握技术精髓。