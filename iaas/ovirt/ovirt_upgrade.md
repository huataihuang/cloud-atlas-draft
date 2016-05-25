oVirt升级分多个步骤：

* 通过`yum`升级系统软件包

```bash
yum upgrade -y
```

* 通过`engine-setup`升级engine节点

在engine服务器上执行以下命令升级引擎软件

```bash
engine-setup
```
* 通过`engine`管理平台升级`node`节点的VDSM软件包

