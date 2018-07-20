# 找到系统尚未安装的工具命令属于哪个rpm包

经常会在需要使用某个工具软件的时候，不知道应该安装哪个rpm软件包。虽然 [rpm.pbone.net](http://rpm.pbone.net/) 提供了在线搜素软件包的功能，不过，对于使用YUM管理的服务器，实际上可以通过`yum provides`命令来找到对应软件包，或者使用`yum whatprovides`命令。

以下举例寻找哪个软件包提供了命令`lssubsys`

```bash
yum provides pstack

yum whatprovides pstack
```

输出显示

```bash
Loaded plugins: branch, fastestmirror
Loading mirror speeds from cached hostfile
alios.7u2.base.x86_64/x86_64/filelists_db      | 6.7 MB  00:00:00
ops.7.noarch/7/filelists_db                    | 182 kB  00:00:00
ops.7.x86_64/7/x86_64/filelists_db             | 309 kB  00:00:00
taobao.7.noarch.stable/filelists_db            |  48 kB  00:00:00
taobao.7.x86_64.stable/filelists_db            |  11 MB  00:00:00
gdb-7.6.1-80.1.alios7.x86_64 : A GNU source-level debugger for C, C++, Fortran, Go and other languages
Repo        : alios.7u2.base.x86_64
Matched from:
Filename    : /usr/bin/pstack
```

可以看到`gdb`软件包提供了该`pstack`工具命令。

> 参考[How to find out which package a file belongs to?](http://unix.stackexchange.com/questions/4705/how-to-find-out-which-package-a-file-belongs-to)

# yum使用代理服务器

有时候需要使用[polipo](../../../../service/proxy/polipo.md)这样的代理服务器访问internet资源，如果偶尔使用yum安装软件包，可以设置**当前用户**环境变量`http_proxy`来实现安装：

```bash
export http_proxy="http://PROXY_IP:8123"
yum upgrade
yum install XXXX
```

如果要一直使用代理服务器方式，则修改`/etc/yum.conf`配置文件，添加：

```bash
# The proxy server - proxy server:port number
proxy=http://PROXY_IP:8123
# The account details for yum connections
proxy_username=yum-user
proxy_password=qwerty
```

> 参考[Using yum with a Proxy Server](https://www.centos.org/docs/5/html/yum/sn-yum-proxy-server.html)

# 查看软件包属于哪个仓库

* `yum list 软件包`可以显示软件包的详细版本，并且可以显示软件包属于哪个软件库

在[部署oVirt](../../../../iaas/ovirt/deploy_ovirt.md) v3.6 的时候，在engine关机控制台添加host后，软件包安装到node节点的时候出现报错：

```bash
RuntimeError: Cannot locate gluster packages, possible cause is incorrect channels
2016-06-10 11:38:59 ERROR otopi.context context._executeMethod:165 Failed to execute stage 'Setup validation': Cannot locate gluster packages, possible cause is incorrect channels
```

我检查了是可以安装`glusterfs`和`glusterfs-cli`软件包的，但是`yum search vdsm`却只有`vdsm-jsonrpc-java.noarch`，不像以前安装的ovrit节点有大量的`vdsm`软件包。[Ovirt 3.5 problem adding GlusterFS servers](http://permalink.gmane.org/gmane.comp.emulators.ovirt.user/26370) 提示需要检查服务器即诶单是否有`vdsm-gluster`软件包。

检查 `/usr/share/ovirt-host-deploy/plugins/ovirt-host-deploy/gluster/packages.py` 果然有：

```python
    def _validation(self):
        if not self.packager.queryPackages(patterns=('vdsm-gluster',)):
            raise RuntimeError(
                _(
                    'Cannot locate gluster packages, '
                    'possible cause is incorrect channels'
                )
            )
        self._enabled = True

    @plugin.event(
        stage=plugin.Stages.STAGE_PACKAGES,
        condition=lambda self: self._enabled,
    )
    def _packages(self):
        self.packager.installUpdate(('vdsm-gluster',))
```

那么究竟是谁提供了这个软件包？在节点上使用命令`yum list vdsm-gluster`发现是最早安装的`ovirt-3.5`提供了这个软件包（后来又升级到ovirt-3.6反而没有这个软件包）

```bash
vdsm-gluster.noarch                                              4.16.26-0.el6                                               @ovirt-3.5
```

检查 http://resources.ovirt.org/pub/ovirt-3.5/rpm/el6Server/noarch/ 果然有这个软件包，而且版本要高于EPEL提供的版本。所以删除掉EPEL仓库，添加 `@ovirt-3.5` 仓库，即再增加 `/etc/yum.repos.d/ovirt-3.5.repo` （和`ovirt-3.6.repo`并存，内容是从`ovirt-3.6.repo`复制并修改版本号成`3.5`）。这样就可以使用`ovirt 3.5`仓库中的软件包，同时由于`ovirt 3.6`中相关软件版本较新，也不会错误覆盖

```bash
[ovirt-3.5]
name=Latest oVirt 3.5 Release
#baseurl=http://resources.ovirt.org/pub/ovirt-3.5/rpm/el$releasever/
mirrorlist=http://resources.ovirt.org/pub/yum-repo/mirrorlist-ovirt-3.5-el$releasever
enabled=1
skip_if_unavailable=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-ovirt-3.5
```

> 总之，使用`yum list 软件包`名字可以找寻出对应的软件仓库，也就可以进一步排查问题的原因

# 避免升级部分软件包

如果由于一些原因需要保持系统中某些软件包不升级，如兼容性，特定测试，则可以通过在`/etc/yum.conf`中添加 `exclude=`配置行来跳过：

```
## Exclude following Packages Updates ##
exclude=perl php python
```

# `yum update`和`yum upgrade`的差别

> 参考 [yum update和upgrade的区别？](https://segmentfault.com/q/1010000008228111)

`yum update`和`yum upgrade`的功能是一样的，都是将需要更新的package更新至软件源中的最新版。唯一不同是：`yum upgrade`会删除旧版本的package，而`yum update`则会保留。

注意！如果你的某些软件依赖旧版本的package，请使用`yum update`。

在[yum equivalent to apt-get upgrade vs apt-get dist-upgrade?](https://serverfault.com/questions/298146/yum-equivalent-to-apt-get-upgrade-vs-apt-get-dist-upgrade/298158#298158)有详细说明：

`yum update`只是升级软件包到新版本。例如，`foo-awesome`淘汰替换了`foo`，但是`yum update`不会将`foo`更改升级成`foo-awesome`。必须加上`--obsoletes`这个开关这样`yum update`才会进行扩展检查来提供更新路径。

而`yum upgrade`则相当于`yum --obsoletes update`，也就是可以直接将旧软件包体换成新的软件包，这样`foo`就会被升级体换成`foo-awesome`。通常，由于某些软件依赖旧版本软件包来运行，则应该使用`yum update`，如果没有这种旧版兼容要求，则可以使用`yum upgrade`，以便能够使用最新的软件体系。

> 在线维护的服务器，通常求稳定，可能使用`yum update`较安全一些。此外，需要做好完整的兼容稳定性测试。

如果希望`yum update`时避免更新内核，可以使用`yum --exclude=kernel* update`。见前述**避免升级部分软件包**，通过配置文件`yum.conf`也可以达到相同效果。