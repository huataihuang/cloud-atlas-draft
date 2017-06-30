# Devstack

Devstack是一套给开发人员快速部署OpenStack开发环境的脚本，不适用于生产环境。Devstack将自动下载源代码，自动执行所有服务的安装脚本，自动生成正确的配置文件，自动安装依赖的软件包。

[DevStack文档](http://docs.openstack.org/developer/devstack/)推荐初学者使用[All-in-One Single VM](http://docs.openstack.org/developer/devstack/guides/single-vm.html)来快速部署一个开发环境。

* 虚拟机

可以使用任何支持Linux发行版本的虚拟机，建议使用4G内存可以获得最好的执行效率。OpenStack官方文档推荐[All-In-One Single VM](http://docs.openstack.org/developer/devstack/guides/single-vm.html)方式运行DevStack，可以在各种虚拟机环境中部署DevStack。

* [最小化配置](http://docs.openstack.org/developer/devstack/configuration.html#minimal-configuration)

> 虚拟机采用CentOS 7初始最小化安装，并按照[CentOS最小化安装后安装的软件包](../../os/linux/redhat/package/yum_after_mini_install)安装必要的开发工具包

> 运行DevStack的主机的内存不要过小，我在实践中最初分配了1C1G的KVM虚拟机，在安装过程中，nuturn服务会因为OOM被杀掉，导致反复失败，非常麻烦。最后还是通过[动态调整KVM虚拟机内存和vcpu](../../../virtual/kvm/startup/in_action/add_remove_vcpu_memory_to_guest_on_fly)将虚拟机的配置调整成4C8G顺列完成部署安装，我估计普通的运行可能需要2C4G的配置才能正常部署运行DevStack。

* 添加stack用户

Devstack使用非root用户的sudo来工作

```
adduser stack
```

```bash
echo "stack ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
su - stack
```

* 下载DevStack

```bash
git clone https://git.openstack.org/openstack-dev/devstack
cd devstack
```

* 创建`local.conf`

在`devstack`这个git repo目录中，创建`local.conf`设置4个密码

```
[[local|localrc]]
ADMIN_PASSWORD=secret
DATABASE_PASSWORD=$ADMIN_PASSWORD
RABBIT_PASSWORD=$ADMIN_PASSWORD
SERVICE_PASSWORD=$ADMIN_PASSWORD
```

* 启动安装

```bash
./stack.sh
```

最新更新版本安装提示错误

```
+inc/python:pip_install:335                sudo -H http_proxy= https_proxy= no_proxy= PIP_FIND_LINKS= SETUPTOOLS_SYS_PATH_TECHNIQUE=rewrite /bin/pip2.7 install -c /opt/stack/requirements/upper-constraints.txt -r /opt/stack/keystone/test-requirements.txt -e /opt/stack/keystone
Ignoring EditorConfig: markers 'python_version == "3.4"' don't match your environment
Ignoring EditorConfig: markers 'python_version == "3.5"' don't match your environment
```

似乎是依赖Python 3.4+以上版本。

自动完成软件包安装和配置，可能需要多次安装（网络是关键）。安装完成后，源代码位于`stack`中，可以进行相关分析和开发。

devstack将安装 keystone, glance, nova, cinder, neutron, 和 horizon。对于使用，可以切换到 `stack` 用户身份以后，进入 `devstack` 目录，然后执行 `source openrc` 设置好操作环境，就可以使用 `openstack` 命令管理 devstaack。

完成后可以访问 http://<SERVER_IP>

# IPv4

对于配置了IPv6的主机，DevStack会直接启动服务监听在IPv6的地址上，反而不监听IPv4。

采用[关闭CentOS 7 IPv6](../../os/linux/redhat/system_administration/network/centos7_disable_ipv6)

# 重启

> 参考 [Cannot restart services on Devstack](https://ask.openstack.org/en/question/1916/cannot-restart-services-on-devstack/)

Devstack不是通过服务方式运行的，而是通过`screen`程序。在成功运行了`stack.sh`之后，如果需要重启任何openstack服务，使用`screen -r`来连接screen。例如，要重启nova网络，则连接screen 9来访问nova网络的screen（使用命令`CTRL+A`和`9`）。要停止nova网络，使用｀CTRL+C`然后再使用向上键再回车。

如果重启了主机，则还是需要再运行一次`stack.sh`脚本。

# devstack环境要求

最初我安装devstack是在kvm虚拟机中，分配了1c1g配置（即1个vcpu 1GB内存的kvm虚拟机），安装过程没有太大资源问题。但是实际运行devstack时候，发现`neutron`虚拟网络非常消耗CPU资源（有3个进程`neutron`服务进程始终在运行），并且使用了近1GB的swap空间。所以准备调整虚拟机的内存河CPU资源：

通过[动态调整KVM Guest内存和CPU资源](add_remove_vcpu_memory_to_guest_on_fly)

如果由于意外中断devstack运行（如强制关机），则需要先运行 `./unstack.sh` 清理环境，然后重启运行 `./stack.sh` 脚本重建会话。

# 访问

在本地桌面主机`/etc/hosts`添加访问`devstack`测试环境的域名解析绑定

```
192.168.1.11  devstack
```

然后通过 https://devstack/dashboard 来访问web管理界面

* 命令行访问

使用`stack`用户身份，执行以下命令可以访问OpenStack命令行操作


```
source openrc
openstack
```

# NAT端口映射之后解决web访问

> 我的`devstack`测试环境是安装在[CentOS平台的KVM虚拟机](../../../virtual/kvm/startup/in_action/deploy_kvm_on_centos)，采用的[NAT端口映射方式](../../../virtual/kvm/startup/in_action/kvm_libvirt_static_ip_for_dhcp_and_port_forwarding)，所以访问是 https://devstack:11443 。如果你采用的bridge模式虚拟机或者直接安装在物理主机上，则不需要添加端口`11433`

这次安装在[CentOS平台的KVM虚拟机](../../../virtual/kvm/startup/in_action/deploy_kvm_on_centos)，采用的[NAT端口映射方式](../../../virtual/kvm/startup/in_action/kvm_libvirt_static_ip_for_dhcp_and_port_forwarding)，发现通过 http://devstack:1180/dashboard 访问提示

```
Not Found

The requested URL /dashboard/ was not found on this server.
```

检查了服务器上的`/etc/httpd/conf.d/horizon.conf`发现配置路径确实是`dashboard`

```
<VirtualHost *:80>
    WSGIScriptAlias /dashboard /opt/stack/horizon/openstack_dashboard/wsgi/django.wsgi
    WSGIDaemonProcess horizon user=stack group=stack processes=3 threads=10 home=/opt/stack/horizon display-name=%{GROUP}
    WSGIApplicationGroup %{GLOBAL}
    ...
```

可以看到虚拟主机的识别是通过端口来辨别，由于采用了NAT，对于浏览器客户端的端口变化（http采用1180, https采用11443），所以没有匹配Apache的虚拟主机配置。

[Declaring multiple ports for the same VirtualHosts](http://serverfault.com/questions/219261/declaring-multiple-ports-for-the-same-virtualhosts)提供了同一VirtualHost多个端口的配置案例，所以修改如下

```
Listen 80
NameVirtualHost *:80

Listen 1180    
NameVirtualHost *:1180

<VirtualHost *:80 *:1180>
  ...
</VirtualHost>
```

# 停止DevStack

`unstack.sh`将停止所有由`stack.sh`启动的进程。所有进程的停止可以通过命令行设置`UNSTACK_ALL`或在`specifying --all`

```
./unstack.sh --all
```

# 重启devstack

将卷组online这样`cinder-volume`将无错启动

```
sudo losetup -f /opt/stack/data/stack-volumes-backing-file
```

使用`rejoin-stack.sh`来重启DevStack

```
./rejoin-stack.sh &
```

# 访问报错排查

* 安装过程中有时候会出现Python模块版本不满足运行要求到报错，这是因为DevStack安装时采用的是操作系统yum install安装Python模块，但是当前操作系统的Python模块尚未更新到符合要求的版本或者发行版本身没有提供满足版本要求的Python模块。例如报错类似如下

```
...
ContextualVersionConflict: (os-win 1.2.1 (/usr/lib/python2.7/site-packages), Requirement.parse('os-win>=1.3.0'), set(['cinder']))
+inc/python:pip_install:1                  exit_trap
...
```

解决的方法是采用手工方法通过`pip`先删除掉不满足要求的Python模块，然后再通过`pip`安装就能够获得最新的Python模块即能够满足要求

```
sudo pip uninstall os-win
sudo pip install os-win
```

* 安装horizon时出现一个python模块冲突，报错如下：

```
+inc/python:pip_install:222                sudo -H http_proxy= https_proxy= no_proxy= PIP_FIND_LINKS= SETUPTOOLS_SYS_PATH_TECHNIQUE=rewrite /bin/pip2.7 install -c /opt/stack/requirements/upper-constraints.txt -e /opt/stack/horizon
Ignoring dnspython3: markers 'python_version == "3.4"' don't match your environment
Ignoring dnspython3: markers 'python_version == "3.5"' don't match your environment
Obtaining file:///opt/stack/horizon
Exception:
Traceback (most recent call last):
  File "/usr/lib/python2.7/site-packages/pip/basecommand.py", line 215, in main
    status = self.run(options, args)
  File "/usr/lib/python2.7/site-packages/pip/commands/install.py", line 335, in run
    wb.build(autobuilding=True)
  File "/usr/lib/python2.7/site-packages/pip/wheel.py", line 749, in build
    self.requirement_set.prepare_files(self.finder)
  File "/usr/lib/python2.7/site-packages/pip/req/req_set.py", line 380, in prepare_files
    ignore_dependencies=self.ignore_dependencies))
  File "/usr/lib/python2.7/site-packages/pip/req/req_set.py", line 521, in _prepare_file
    req_to_install.check_if_exists()
  File "/usr/lib/python2.7/site-packages/pip/req/req_install.py", line 1036, in check_if_exists
    self.req.name
  File "/usr/lib/python2.7/site-packages/pip/_vendor/pkg_resources/__init__.py", line 558, in get_distribution
    dist = get_provider(dist)
  File "/usr/lib/python2.7/site-packages/pip/_vendor/pkg_resources/__init__.py", line 432, in get_provider
    return working_set.find(moduleOrReq) or require(str(moduleOrReq))[0]
  File "/usr/lib/python2.7/site-packages/pip/_vendor/pkg_resources/__init__.py", line 968, in require
    needed = self.resolve(parse_requirements(requirements))
  File "/usr/lib/python2.7/site-packages/pip/_vendor/pkg_resources/__init__.py", line 859, in resolve
    raise VersionConflict(dist, req).with_context(dependent_req)
ContextualVersionConflict: (python-novaclient 7.0.0 (/usr/lib/python2.7/site-packages), Requirement.parse('python-novaclient!=7.0.0,>=6.0.0'), set(['horizon']))
```

反复测试发现是即使手工安装了`python-novaclient 7.1.0`也会被`horizon`包之前安装重安装成`7.0.0`，所以根据`/opt/stack/requirements/upper-constraints.txt`配置检查，将

```
python-novaclient===7.0.0
```

修改成

```
python-novaclient===7.1.0
```

> 另外一种解决方法是在重新执行`./unstack.sh`之后，完整删除掉`/opt/stack`目录(`./stack.sh`之前)。因为`./stack.sh`不 会重新处理`/opt/stack`目录中文件，导致上次安装失败时的错误残留文件影响下一次安装。

* offline compression错误

访问horzion的web管理界面，提示错误：`You have offline compression enabled but key "99881c8d68eccb35d990b7ea3aa134cb" is missing from offline manifest. You may need to run "python manage.py compress".`

参考 [Stack do DevStack](https://groups.google.com/forum/#!topic/openstack-br/3Y49S9zjVi4) 执行以下命令

```
python /opt/stack/horizon/manage.py compress
```

不过，遇到一个报错`CommandError: An error occurred during rendering /opt/stack/horizon/openstack_dashboard/templates/_stylesheets.html: Couldn't find anything to import: ../../mixins`

最后参考 [Error running manage.py compress after https://review.openstack.org/#/c/399771/](https://bugs.launchpad.net/horizon/+bug/1643689)

```
cd /opt/stack/horizon
python manage.py collectstatic --noinput && python manage.py compress --force
```

不过，这个方法也存在问题，每次`python manage.py compress`之后，只有这个访问过的页面正常，访问新页面还是存在相同问题，所以考虑采用关闭`offline compression`或者找出如果解决`Django`的compress模式的正确使用方法。

参考 [Horizon - OfflineGenerationError](https://lists.gt.net/openstack/dev/22379) 修改 `/opt/stack/horizon/openstack_dashboard/settings.py`

```
#COMPRESS_ENABLED = True
COMPRESS_ENABLED = False
```

然后重启httpd

```
service httpd restart
```

* 无法访问css文件

访问horizon时候，发现十分缓慢，从浏览器的ipspect记录来看，是由于无法现在很多css和js文件导致的。检查Apache日志显示：

```
192.168.1.101 - - [30/Jan/2017:12:07:08 +0800] "GET /dashboard/static/horizon/lib/bootstrap_datepicker/datepicker3.css HTTP/1.1" 404 263 "http://devstack/dashboard/auth/login/?next=/dashboard/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8"
```

对应检查了`/opt/stack/horizon/static`目录（根据`/etc/httpd/conf.d/horizon.conf`配置显示`Alias /dashboard/static /opt/stack/horizon/static`），发现该目录确实是空的。

参考[Django Static files 404](http://stackoverflow.com/questions/12809416/django-static-files-404)可知OpenStack使用Django是通过`settings.py`文件来配置的，也就是同样编辑`/opt/stack/horizon/openstack_dashboard/settings.py`可以看到有关`STATIC_ROOT`、`STATIC_URL`以及`STATICFILES_DIRS`等配置

```
STATIC_ROOT = None
STATIC_URL = None
STATICFILES_FINDERS = (
XSTATIC_MODULES = settings_utils.BASE_XSTATIC_MODULES
if STATIC_ROOT is None:
    STATIC_ROOT = os.path.abspath(os.path.join(ROOT_PATH, '..', 'static'))
if STATIC_URL is None:
    STATIC_URL = WEBROOT + 'static/'
STATICFILES_DIRS = settings_utils.get_xstatic_dirs(
    XSTATIC_MODULES, HORIZON_CONFIG)
STATICFILES_DIRS += theme_settings.get_theme_static_dirs(
    'STATIC_URL': STATIC_URL,
```

这里可以看到默认配置是符合要求的，但是需要执行一步

```
cd /opt/stack/horizon
python manage.py collectstatic -link --noinput
```

这样就可以将静态文件复制到`/opt/stack/horizon/static`目录下。

#  参考

* [DevStack文档](http://docs.openstack.org/developer/devstack/)
* [OpenStack: Quick Install using DevStack](http://andirog.blogspot.com/2014/02/openstack-quick-install-using-devstack.html)