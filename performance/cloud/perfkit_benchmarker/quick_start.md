[PerfKit Benchmarker](https://github.com/GoogleCloudPlatform/PerfKitBenchmarker)是一个开源云计算性能测试工具。

# 准备

在使用PerfKit Benchmarker之前，需要在云计算服务商平台设置好账号，这样才能通过PerfKit Benchmarker进行测试。

* [Google Cloud Platform](https://cloud.google.com)
* [AWS](http://aws.amazon.com)
* [Azure](http://azure.microsoft.com)
* [AliCloud](http://www.aliyun.com)
* [DigitalOcean](https://www.digitalocean.com)
* [Rackspace Cloud](https://www.rackspace.com)
* [ProfitBricks](https://www.profitbricks.com/)

> 如果在Windows上，需要安装GitHub Windows，因为其包含了工具如`openssl`和`ssh`客户端。也可以选择安装Cygwin，同样也包含了相同的工具。

# 安装Python 2.7和pip

如果使用Windows，则从[这里](https://www.python.org/downloads/windows/)获取Python 2.7（包含了`pip`）。确保命令行`PATH`环境包含了`python`和`pip`命令。

大多数Linux和Mac OS X发行版都包含了Python 2.7，否则需要单独安装。古老的发行版可参考[CentOS 5 Python开发环境部署](../../../develop/python/startup/install_python_2.7_and_virtualenv_in_centos_5)

如果需要安装`pip`可以参考[这些介绍](http://pip.readthedocs.org/en/stable/installing/)

# (Windows)安装GitHub Windows:

参考 https://windows.github.com/ 安装，确保 `openssl/ssh/scp/ssh-keygen`位于路径中，以便在命令行访问。

# 安装PerfKit

从GitHub下载Perkit Benchmarker:

```
wget https://github.com/GoogleCloudPlatform/PerfKitBenchmarker/archive/v1.13.0.zip
unzip v1.13.0.zip
```

# 安装PerfKit Benchmarker依赖

* 如果全局安装依赖

```bash
cd /path/to/PerfKitBenchmarker
sudo pip install -r requirements.txt
```

# 参考

* [PerfKitBenchmarker](https://github.com/GoogleCloudPlatform/PerfKitBenchmarker)