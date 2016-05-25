# yum找不到软件包

```bash
  - name: Install {{ packages_3 }}
    yum:
      name: "{{ packages_3 }}"
      state: latest
```

遇到报错 `msg: No Package matching 'example-package-3' found available, installed or updated`，但是登录到服务器上，使用 `yum install example-package-3`却显示能够从软件仓库找到这个软件包。

[Ansible No Package matching found available installed or updated](http://pingtool.org/ansible-package-matching-found-available-installed-updated/) 提到了可能系统缺少`yum-utils`，但是使用如下命令验证

```bash
ansible all -i iplist_vm -m raw -a "yum -y install yum-utils" --user=admin --sudo
```

实际稀释系统已经安装了`yum-utils`

```bash
192.168.1.11| success | rc=0 >>
Loaded plugins: branch, fastestmirror, security
Loading mirror speeds from cached hostfile
Setting up Install Process
Package yum-utils-1.1.16-17.2.el5.noarch already installed and latest version
Nothing to do
```

注意：`sudo: true`就会导致上述错误（参考[yum package installation fails on RHEL6 with RHN and yum-utils installed](https://github.com/ansible/ansible/issues/5904)）

不过，依然存在问题，所以想debug一下，参考 [Debugging Ansible tasks](https://wincent.com/wiki/Debugging_Ansible_tasks)，执行命令时加上`-vvvvv`

```bash
time ansible-playbook -i iplist_vm example-package_install.yaml -vvvvv
```

发现执行过程中没有正真使用过`yum`从仓库同步，所以参考 [yum - Manages packages with the yum package manager](http://docs.ansible.com/ansible/yum_module.html) 原来有一个参数是 `enablerepo` 可以用来激活repo。但是，为什么ansible不能找到软件包，而通过终端登录系统却能够使用`yum install`来安装软件包呢？

原来，我们的服务器有一个坑，在服务器上`/etc/yum.repos.d`所有的reposity全部是设置成`enabled=0`：

```bash
[XXXX.5.noarch.stable]
...
enabled=0
type=multi
gpgcheck=0
...
```

这就导致了Ansible根本不能使用repo配置。将这个配置修改成`enabled=1`就能够正常使用`yum`模块进行安装了。

但是，修改所有服务器的repo配置不现实，可以采用在Playbook中设置`enablerepo: "XXXX.5.noarch.stable"`解决。