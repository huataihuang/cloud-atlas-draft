> 开发参考[OpenStack SDK](https://developer.openstack.org/sdks/python/openstacksdk/users/index.html) 和

# 安装

腾讯云Qcloud API安装通过

```
pip install qcloudapi-sdk-python
```

> 腾讯云有类似OpenStack的[python-openstackclient](https://pypi.python.org/pypi/python-openstackclient)这样的命令行客户端么？
>
> 阿里云有[aliyuncli](https://pypi.python.org/pypi/aliyuncli)...
>
> 原来也有 [Tencent Cloud Command Line Interface (CLI)](https://cloud.tencent.com/document/product/440/6176?lang=en)，不过文档非常简略，只有英文版。

> 有关账号和访问安全凭证请参考 [腾讯云Python API SDK快速起步](../../../../iaas/tencent/api/qcloud_python_api_startup)

安装CLI

```
pip install qcloudcli
```

# PerfKit BenchMarker代码结构

参考 [PerfKit Benchmarker增加新的云服务商](../perfkit_benchmarker_add_new_cloud_provider) 主要的代码结构可以从现有的代码结构中clone出来，然后修改命令。因为云服务商的系统架构大同小异，例如，可以从阿里云`providers/alicloud`中clone出`providers/qcloud`。

