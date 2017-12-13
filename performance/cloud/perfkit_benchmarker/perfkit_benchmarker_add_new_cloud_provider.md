# 要求和假设

对于PerfKit Benchmarker，要求云服务商必须提供一个自动化方式来提供和配置云资源，包括相应的错误报告和状态检测。

命令行工具是通用的优先选项。benchmarker会在东记录执行时命令行日志，这样用户就能够检查或调试。

可选的，如果Python API也能工作，但是如果很难调试，除非你添加了详细的日志来确保操作清晰可视。并且，新的云服务商不能约束用户不使用它的附加要求，及使用非标准模块将导致加载缓慢。（issue #373）

工具/API要求的功能：

* 使用指定启动磁盘镜像，如Ubuntu 14.04，创建一个虚拟机，并获取它所分配的IP地址
* 创加一个非root用户（默认是`perfkit`）用于Linux VM:
  * 使用提供的公钥无需密码SSH登陆
  * 无需密码的sudo
* guest OS必须能够从Internet下载数据，例如为benchmark下载分发的tar包。也支持proxy。
* 销毁VM

可选的但有用的工具/API特性：

* 配置防火墙（简单的"允许所有"静态配置也可以）
* `创建/添加/销毁` 附加的块存储设备用于测试磁盘。这个功能可选，如果标准的启动磁盘有足够空间运行benchmark的话。
* 检查现存的一个特定虚拟机或资源。这在自动重试失败的`创建/删除`请求时候有用。
* 使用包管理器来添加依赖。可选的方法是，一个定制的基础镜像包含所有需要的软件。

# 概览

需要以下步骤来在PerfKitBenchmarker中支持一个新的云服务商

* 创建一个实现的类用于 `虚拟机/磁盘/网络` 资源
* 如果需要，添加定制的软件包
* 编辑`perfkitbenchmarker/benchmark_spec.py`来集成这个新的实现
* 更新`README.md`

# 通用的要求

## 线程安全

云计算供应商的实现，包括资源管理必须是线程安全的。`PerfKitExplorer`会并发执行多个benchmark，包括并发资源的创建和销毁。

## 使用默认部署，使用flag来tuning

部署VM和OS镜像将使用默认的性能相关配置和选项，所以结果将符合用户的典型体验。

对于增加选项tuning也是可以的，例如主机类型的特定sysfs配置，但是默认通过一个flag来关闭，例如`--rackspace_apply_onmetal_ssd_tuning`。

# 创建资源实现类

`PerfKitBenchmarker`基于资源类的层次结构，以下是示意：

```
BaseResource
│
├── BaseDisk
│   │
│   ├─ StripedDisk
│   ├─ AwsDisk
│   ├─ AzureDisk
│   └─ GceDisk
│
├── BaseFirewall
│
├── BaseNetwork
│
├── BaseVirtualMachine
│   │
│   ├─ AwsVirtualMachine
│   │  ├─ DebianBasedAwsVirtualMachine
│   │  └─ RhelBasedAwsVirtualMachine
│   │
│   └─ GceVirtualMachine
│      ├─ DebianBasedGceVirtualMachine
│      └─ RhelBasedGceVirtualMachine
│
├── AzureAffinityGroup
├── AzureStorageAccount
└── AzureVirtualNetwork
```

在大多数基础曾，每个资源必须支持创建和上述方法来是下一个基本的生命循环。默认实现这些方式是在`BaseResource`：

```python
def Create(self):
    self._CreateDependencies()
    self._CreateResource()
    self._PostCreate()

  def Delete(self):
    self._DeleteResource()
    self._DeleteDependencies()

  @vm_util.Retry(retryable_exceptions=(errors.Resource.RetryableCreationError,))
  def _CreateResource(self):
    self._Create()
    try:
      if not self._Exists():
        raise errors.Resource.RetryableCreationError(...)
    except NotImplementedError:
      pass
```

要遵循这个生命循环，你的子类必须实现`_Create`和`_Delete`方法。`_Exists`是可选的，但是强烈建议以实现更为健壮。

如果虚拟机要求附加资源独立创建和销毁，你需要通过独立的资源类来处理，这个资源类被上层资源所依赖。这有助于确保被依赖的资源被相应清理。例如，包括IP地址，网络或者测试盘并不是基础VM自动包含的。

# 包安装支持

`PerfKitBenchmarker`提供恰当的混合Debian(基于Apt)和RHEL（基于Yum）的安装器：

```python
class DebianBasedGceVirtualMachine(GceVirtualMachine, linux_virtual_machine.DebianMixin):
  pass


class RhelBasedGceVirtualMachine(GceVirtualMachine, linux_virtual_machine.RhelMixin):
  pass
```

所有支持的包位于 `perfkitbenchmarker/packages/`，并且添加一个mixin类到`perfkitbenchmarker/linux_virtual_machine.py`来使用相应的`{name}Install(vm)`功能。

# `benchmark_spec.py`集成

参考[current examples](https://github.com/GoogleCloudPlatform/PerfKitBenchmarker/blob/master/perfkitbenchmarker/benchmark_spec.py):

* import云相关资源类
* 添加新的段落到`DEFAULTS` 和 `CLASSES`目录
* 添加新的云名字到`cloud`枚举标志

# 参考

* [Adding a new cloud provider](https://github.com/GoogleCloudPlatform/PerfKitBenchmarker/wiki/Adding-a-new-cloud-provider)