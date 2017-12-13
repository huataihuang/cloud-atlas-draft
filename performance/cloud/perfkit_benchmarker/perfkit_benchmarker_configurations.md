# 概述

* PerfKit Benchmarker默认通过配置文件决定如何运行（如果没有传递参数的话）
* 通过提供配置文件或者使用命令行参数可以覆盖默认配置的设置

# 配置文件结构

配置文件是[YAML](http://www.yaml.org/)格式 - 在 `perfkitbenchmarker/configs/` 目录下有相关的`.yaml`配置文件。

# 指定配置文件和处理规则

以下案例时修改`cluster_boot`压测创建的vm数量：

```
./pkb.py --benchmark_config_file=cluster_boot.yml --benchmarks=cluster_boot
```

举例`cluster_boot.yml`

```yaml
cluster_boot: 
  vm_groups:
    default:
      vm_count: 10
```

如果使用`--config_override`参数，则直接覆盖配置文件，并且任何通过这个参数的设置将具有一个较高的优先级。以下时修改默认`cluster_boot`配置的参数：

```
./pkb.py --config_override="cluster_boot.vm_groups.default.vm_count=10" --benchmarks=cluster_boot
```

# 参考

* [PerfKitBenchmarker Configurations](https://github.com/GoogleCloudPlatform/PerfKitBenchmarker/wiki/PerfkitBenchmarker-Configurations)