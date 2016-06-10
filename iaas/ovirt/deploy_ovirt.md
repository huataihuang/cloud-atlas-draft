# 安装oVirt Engine

集群中的服务器选择一台作为管控服务器，也就是运行`oVirt Engine`的主机，按照以下步骤执行安装

* 安装oVirt软件仓库

```bash
sudo yum install -y http://resources.ovirt.org/pub/yum-repo/ovirt-release36.rpm 
```

* 安装oVirt引擎，这个步骤是下载oVirt Engine安装软件并安装，但尚未初始化

```bash
sudo yum install -y ovirt-engine
```

* 上述软件安装后，执行installer

```bash
sudo engine-setup
```

按照提示答复：

如果是作为虚拟机管控平台，可以简单答复`Yes`按照默认进行。如果部署管理GlusterFS，或者要采用独立的Proxy服务器，可以采用如下答复

```
          Configure Engine on this host (Yes, No) [Yes]:
          Configure VM Console Proxy on this host (Yes, No) [Yes]: No
          Configure WebSocket Proxy on this host (Yes, No) [Yes]: No
```

域名设置注意：要将正确的`FQDN`域名设置在`/etc/hosts`中，这样才能保证域名解析正确。这也是规范的`hosts`文件设置方式，例如：

```bash
192.168.1.1 ovirt.example.com ovirt
```

这样在`engine-setup`的网络设置一步中会提示正确的FQDN主机名，例如：

```bash
Host fully qualified DNS name of this server [ovirt.example.com]:
```

按照提示，可以选择管理引擎既管理虚拟化又管理GlusterFS，或者管理其中之一。

**`engine-setup`设置会生成配置文件存放在`/etc/ovirt-engine-setup.conf.d`目录下**，如果要重新配置，例如要修改域名，则可以修改该目录下的`20-setup-ovirt-post.conf`配置文件，然后重新启动一次`engine-setup`



# 参考

* [oVirt Quick Start Guide](http://www.ovirt.org/documentation/quickstart/quickstart-guide/)