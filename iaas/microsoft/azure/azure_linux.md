> 操作采用Azure CLI从命令行

# 安装Azure CLI

> 参考[安装 Azure CLI 2.0](https://docs.azure.cn/zh-cn/cli/install-azure-cli?view=azure-cli-latest)

* 通过`yum`安装

```
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

sudo sh -c 'echo -e "[azure-cli]\nname=Azure CLI\nbaseurl=https://packages.microsoft.com/yumrepos/azure-cli\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/azure-cli.repo'

yum check-update
sudo yum install azure-cli
```

* 通过脚本安装

> 如果是在Python虚拟环境中运行，先激活虚拟环境

```
curl -L https://aka.ms/InstallAzureCli | bash
```

如果运行环境缺少部分库支持，则会提示需要先安装依赖

```
yum check-update ; yum install -y gcc libffi-devel python-devel openssl-devel
```

> 注意：`TLSv1.2+ is required`，所以在CentOS 5上无法运行（openssl版本只有0.9.8.e）

> 注意：安装脚本会使用操作系统全局环境`/usr`，所以不适合在Python virtualenv中使用。

* 在Python virtualenv环境中安装（我实际采用此方法）

> 注意：在Python virtualenv环境中安装`azure-cli`依然会需要写入`/usr/lib64/python2.7/site-packages/secretstorage`目录，所以需要一定权限，临时执行命令`sudo chmod 777 /usr/lib64/python2.7/site-packages`授予写入权限，然后就可以执行安装

```
pip install azure-cli
```

# 准备Azure运行环境

> 在 Azure 中国区使用 Azure CLI 2.0 之前，请先运行 `az cloud set -n AzureChinaCloud` 来改变云环境。如果想切回国际版 Azure，请再次运行 `az cloud set -n AzureCloud`。

在使用`az`之前，需要先设置账号：

```
az login
```

此时会提示使用浏览器打开 https://microsoft.com/devicelogin 进行设备授权。将终端中提示的设备字符串输入，按照提示进行设备授权。完成授权之后，终端会显示JSON信息提示授权信息完成

# 创建资源组

`az group create`命令创建资源组。Azure资源组是一个逻辑容器用来部署Azure资源

```
az group create --name myResourceGroup --location eastus
```

> 上述资源组创建在美国东部

# 创建虚拟机

```
az vm create --resource-group myResourceGroup --name myVM --image UbuntuLTS --generate-ssh-keys
```

报错

```
This user name 'admin' meets the general requirements, but is specifically disallowed for this image. Please try a different value.
```

# 参考

* [Linux虚拟机](https://docs.microsoft.com/zh-cn/azure/virtual-machines/linux/)，对于中国用户，世纪互联托管的Microsoft Azure提供了相应的[中文文档](https://docs.azure.cn/zh-cn/virtual-machines/linux/quick-create-cli?toc=%2Fvirtual-machines%2Flinux%2Ftoc.json)