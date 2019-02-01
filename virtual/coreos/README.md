CoreOS是以Linux系统为基础，为了建设数据中心的需要，而从Linux底层进行了内核裁减。简单说，CoreOS的采用了ChromiumOS定制，裁剪掉了和图形界面相关的软件包、以及非系统必须的Perl、Python运行环境。

管理CoreOS通常采用SSH的shell方式或者基于Web的工具（ [cAdvisor](https://github.com/google/cadvisor)）。

> 由于容器技术、CoreOS、Kubernetes发展非常迅速，从书本和文档中获取的知识往往很快会落伍，所以本文将结合互联网资源进行汇总，并不断修订。

# 参考

* [深入浅出CoreOS（一）：概述](http://dockone.io/article/1026)