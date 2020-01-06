## 阿里云

> 参考[AliCloud](https://github.com/GoogleCloudPlatform/PerfKitBenchmarker#install-alicloud-cli-and-setup-authentication)步骤

* 安装python开发环境

```
sudo yum install python-devel
```

此外需要安装以下一些依赖开发库

```
sudo yum install libffi-devel.x86_64
sudo yum install openssl-devel.x86_64
pip install 'colorama<=0.3.3'
```

* 安装aliyuncli工具和ECS的python SDK

```
pip install -r perfkitbenchmarker/providers/alicloud/requirements.txt
```

> 注意：需要编译C程序，所以需要`yum groupinstall -y "development tools"`

* 检查验证AliCloud已经安装

```
aliyuncli --help

aliyuncli ecs help
```

* 登陆[AliCloud console](https://home.console.alicloud.com/#/)创建访问`access credentials`（即`AccessKeys`），得到对应的 "Access Key ID" 和 "Access Key Secret" 

* 配置命令行

```
aliyuncli configure
```

> `aliyuncli configure`可以[配置访问帐号的Access Key](https://help.aliyun.com/document_detail/30001.html?spm=a2c4g.11186623.6.574.4mt3hQ)

执行上述配置就可以输入前面在[AliCloud console](https://home.console.alicloud.com/#/)创建的`AccessKeys`完成客户端配置。

> 请参考[阿里云命令行工具帮助](https://help.aliyun.com/product/29991.html?spm=a2c4g.11186623.3.1.Ou3UXG)

使用命令可以参考 [复杂命令示例](https://help.aliyun.com/document_detail/30015.html?spm=a2c4g.11186631.6.582.kV9CKE) 也就是 `aliyuncli ecs` 后面所有的传递参数实际上就是OpenAPI的包装，需要完整参考SDK中的命令可以使用Jetbrains PyCharm浏览AliYun Python SDK(`aliyunsdkecs/request/v20140526`下对应程序代码，命令传递实际上即为Python程序)

`aliyuncli configure`设置的证书位于`~/.aliyuncli/credentials`，配置位于`~/.aliyuncli/configure`


# 运行一个简单的Benchmark

* 在AliCloud运行Benchmark

```
./pkb.py --cloud=AliCloud --machine_type=ecs.t5-lc1m2.small --benchmarks=iperf
```

> 不能使用RAM子账号

注意：执行AliCloud测试前，首先编辑`perfkitbenchmarker/configs/default_config_constants.yaml` 将对应`AliCloud`的配置部分设置好需要开设的规格和区域。规格和区域请参考手工开设的虚拟机：

```yaml
  AliCloud:
    machine_type: ecs.t5-lc1m2.small
    zone: cn-qingdao-c
    image: null
```

主要的

完成日志记录在类似 `/tmp/perfkitbenchmarker/runs/152a8305/pkb.log`