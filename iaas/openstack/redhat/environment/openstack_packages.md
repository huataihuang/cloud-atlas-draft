OpenStack软件包是作为发行版的软件包部分，所有节点都需要执行软件包安装。

> 警告
>
> 在部署OpenStack之前，确保发行版已经采用最新软件包。
>
> 禁止任何自动更新服务，因为自动更新可能会影响OpenStack服务
>
> 建议禁用EPEL，因为使用RDO软件包时使用EPEL会存在中断向后兼容的玩儿提。或者使用`yum-versionlock`插件将软件包版本固化。

* 当使用RHEL时，

# 参考

* [OpenStack Install Guide RDO - Environment: OpenStack packages](https://docs.openstack.org/ocata/install-guide-rdo/environment-packages.html)