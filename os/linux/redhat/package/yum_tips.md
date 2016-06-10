# 找到系统尚未安装的工具命令属于哪个rpm包

经常会在需要使用某个工具软件的时候，不知道应该安装哪个rpm软件包。虽然 [rpm.pbone.net](http://rpm.pbone.net/) 提供了在线搜素软件包的功能，不过，对于使用YUM管理的服务器，实际上可以通过`yum provides`命令来找到对应软件包，或者使用`yum whatprovides`命令。

以下举例寻找哪个软件包提供了命令`lssubsys`

```bash
yum provides lssubsys

yum whatprovides lssubsys
```

输出显示

```bash
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * base: ftp.sjtu.edu.cn
 * extras: ftp.sjtu.edu.cn
 * updates: mirrors.skyshe.cn
base/7/x86_64/filelists_db                               | 6.2 MB     00:11
extras/7/x86_64/filelists_db                             | 258 kB     00:01
updates/7/x86_64/filelists_db                            | 1.9 MB     00:04
libcgroup-tools-0.41-8.el7.x86_64 : Command-line utility programs, services and
                                  : daemons for libcgroup
Repo        : base
Matched from:
Filename    : /usr/bin/lssubsys
```

可以看到`lscgroup-tools`软件包提供了该工具命令。

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

> 总之，使用`yum list 软件包`名字可以找寻出对应的阮籍那仓库，也就可以进一步排查问题的原因

