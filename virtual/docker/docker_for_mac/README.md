运行Docker for mac的系统需要支持MMU（memory management unit）虚拟化的Intel硬件环境，即需要2010年之后的新硬件以及Mac OS X 10.10.3 Yosemite。

Docker for mac分为stable和beta两个版本，只能安装一个版本，虽然可以切换。

系统要求：

* 需要使用2010年之后的硬件以便支持Intel MMU(memory management unit)虚拟化，例如扩展页表(Extended Page Tables, EPT)
* OS X 10.10.3 Yosemite 或更新版本
* 4G内存
* 不能安装VirtualBox 4.3.30之前版本（不兼容）

> 如果系统不满足这些要求，可以安装Docker Toolbox，其附带了Oracle Virtual Box来替代HyperKit

# Docker for Mac vs. Docker Toolbox



# 参考

* [Getting Started with Docker for Mac](https://docs.docker.com/docker-for-mac/)
* [Docker for Mac vs. Docker Toolbox](https://docs.docker.com/docker-for-mac/docker-toolbox/)