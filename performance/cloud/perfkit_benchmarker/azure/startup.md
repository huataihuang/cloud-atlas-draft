

# 安装SDK

微软Azure API安装通过pip实现

* 在Python virtualenv环境中安装

> 注意：如果在Python virtualenv环境中安装`azure-cli`依然会需要写入`/usr/lib64/python2.7/site-packages/secretstorage`目录，所以需要一定权限，临时执行命令`sudo chmod 777 /usr/lib64/python2.7/site-packages`授予写入权限，然后就可以执行安装

```
pip install azure-cli
```

# 配置账号

> 在 Azure 中国区使用 Azure CLI 2.0 之前，请先运行 `az cloud set -n AzureChinaCloud` 来改变云环境。如果想切回国际版 Azure，请再次运行 `az cloud set -n AzureCloud`。

在使用`az`之前，需要先设置账号：

```
az login
```

此时会提示使用浏览器打开 https://microsoft.com/devicelogin 进行设备授权。将终端中提示的设备字符串输入，按照提示进行设备授权。完成授权之后，终端会显示JSON信息提示授权信息完成

# 命令行工具

[微软云命令行工具az](https://docs.microsoft.com/en-us/cli/azure/vm?view=azure-cli-latest#az-vm-create)

创建虚拟机的规格参数`--size`可以参考[Linux Virtual Machines Pricing](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)选择，但是该规格价格页面并没有包含`az`创建规格参数命名列表。实际可以随便传递一个`--size`参数，服务端会自动返回该region所有可用规格的名称列表。

# 测试

在微软云[Azure的Linux虚拟机价格列表](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)中，最低价格的规格是`B1S`，所以首先测试最小规格的启动流程

```
./pkb.py --cloud=Azure --machine_type=Standard_B1s --benchmarks=cluster_boot --zones=eastus
```

不是所有的区域都有可用规格，所以需要通过页面先检查可用区域是否可以创建该规格

## 免费账号升级到 Pay-As-You-Go 付费账号

**`注意`**

Azure对免费试用账号的虚拟机规格和数量有关联性限制，默认情况下资源管理vCPU quota是受到region level和SKU family level组合限制的(参考 [Azure subscription and service limits, quotas, and constraints](https://docs.microsoft.com/en-us/azure/azure-subscription-service-limits))。

* 免费账号限制

免费试用账号在一个region中，只能申请4个core，超过范围会返回报错信息。例如`B1s`规格虚拟机（1个vCPU）在申请超过4个就会报错：

```
Got return code (1).
STDOUT:
STDERR: ERROR: Deployment failed. Correlation ID: 0438dbf7-ebcc-48fa-b3e5-84f88040a2d5. {
  "error": {
    "code": "OperationNotAllowed",
    "message": "Operation results in exceeding quota limits of Core. Maximum allowed: 4, Current in use: 4, Additional requested: 1. Please read more about quota increase at http://aka.ms/corequotaincrease."
  }
}
```

对于需要超过默认Azure Resource Manager限制需要填写工单请求[Resource Manager vCPU quota increase requests](https://docs.microsoft.com/en-us/azure/azure-supportability/resource-manager-core-quotas-request)

对于国内世纪互联运维的Azure云，[1元试用也有4 vCPU限制](https://www.azure.cn/offers/ms-mc-azr-44p/)

> Your free trial subscription isn't eligible for a quota increase. To request a quota increase, first upgrade to a Pay-As-You-Go subscription. Learn more

* 升级`Pay-As-You-Go`

在用户账号的`Home > Cost Management + Billing`中选择`New subscription`添加订购：

一种方式是添加订购，但是可能需要删除掉原有的免费订阅才可以

![添加订购](../../../../img/performance/cloud/perfkit_benchmarker/azure/add_subscription.png)

另外一种是直接升级当前的免费订阅到 `Pay-As-You-Go`

最初我尝试`Add Subscription`一个新的订购，但是发现创建虚拟机依然在原先的"免费试用"订购组，导致无法添加超过4个vCPU的实例。所以改成将"免费试用"订购组`disabled`，只`Active`新添加的`Pay-As-You-Go`。但是，订购创建依然落到"免费试用"订购组中，导致提示错误：

```
STDERR: ERROR: The subscription 'XXXXXXXX' is disabled and therefore marked as read only. You cannot perform any write actions on this subscription until it is re-enabled.
```

上述报错是因为Azure的Subscription有一个`IsDefault`属性，当前默认是第一个创建的"免费使用"订阅组：

```
# az account list --output table
A few accounts are skipped as they don't have 'Enabled' state. Use '--all' to display them.
Name           CloudName    SubscriptionId                        State
-------------  -----------  ------------------------------------  -------
Pay-As-You-Go  AzureCloud   XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  Enabled

# az account list --output table --all
Name           CloudName    SubscriptionId                        State    IsDefault
-------------  -----------  ------------------------------------  -------  -----------
免费试用       AzureCloud   XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  Warned   True
Pay-As-You-Go  AzureCloud   XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  Enabled
```

修改方法使用如下命令：

```
# az account set --subscription "Pay-As-You-Go"
```

然后再次检查就可以看到默认改为`Pay-As-You-Go`

```
# az account list --output table --all
Name           CloudName    SubscriptionId                        State    IsDefault
-------------  -----------  ------------------------------------  -------  -----------
免费试用       AzureCloud   XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  Warned
Pay-As-You-Go  AzureCloud   XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX  Enabled  True
```

> 参考 [Manage subscriptions](https://docs.microsoft.com/en-us/cli/azure/manage-azure-subscriptions-azure-cli?view=azure-cli-latest)

# Quota

在订购了`Pay-As-You-Go`之后，默认每个区域只有10个cpu core可以申请，所以会遇到大规格测试报错：

```
STDOUT:
STDERR: ERROR: Deployment failed. Correlation ID: b21f362c-35b5-4d69-92f0-5d715bf071ad. {
  "error": {
    "code": "OperationNotAllowed",
    "message": "Operation results in exceeding quota limits of Core. Maximum allowed: 10, Current in use: 10, Additional requested: 2. Please read more about quota increase at http://aka.ms/corequotaincrease."
  }
}
```

[Resource Manager vCPU quota increase requests](https://docs.microsoft.com/en-us/azure/azure-supportability/resource-manager-core-quotas-request)中提供了如何申请support增加Quota，其中在选择了对应的区域以及规格后，会自动显示当前你可用的Quota量。



