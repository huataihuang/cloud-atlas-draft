# 获得Ansible

可以参考[Ansible GitHub project](https://github.com/ansible/ansible)，并获得相关的issue跟踪了解bug和功能。

由于Ansible默认管理主机是通过SSH协议，所以不需要在服务器上安装和运行服务，也不需要安装数据等。只需要在一台管控主机安装Ansible就可以从管控中心来管理整个远程服务器。当Ansible管理远程主机，它不需要在被管理主机上安装软件，所以也就不存在需要更新服务器Ansible的问题。

> Ansible版本
>
> Ansible的发布周期通常是4个月，并且由于不需要在远程管理的主机上安装和升级软件，所以很多用户都直接使用Ansible的开发版本。
>
> 建议使用发行版的包管理器来安装最新的Ansible，在RHEL，CentOS，Fedora，Debian和Ubuntu都提供了软件包。

## 控制主机要求

当前Ansible要求运行主机的Python版本是2.6或2.7，在Red Hat，Debian，OS X等BSD系统都支持这样的环境。

> 在OS X中，由于默认的文件句柄设置非常小，所以如果不调整`ulimit`，就会看到`Too many open files`报错。可以通过命令 `sudo launchctl limit maxfiles 1024 unlimited` 来调整。

## 被管理节点要求

在被管理节点上，需要能能够和控制主机通讯，通常使用ssh通讯。并且，主机上需要使用Python 2.5以上版本，对于低版本Python，需要安装`python-simplejson`。

> Ansible的"raw"模块（也就是直接执行命令）和脚本。可以通过"raw"模块给呗管理主机安装`python-simplejson`
>
> 如果远程被管理节点激活了`SELinux`，就需要在被管理节点上安装`libselinux-python`，这样才能在Ansible中使用`copy/file/template`相关功能。需要使用Ansible的yum来安装Ansible模块。
>
> 由于Python 3和Python 2明显的差异，当前Ansilbe还没有切换到Python 3。然而，一些Linux发行版（Gentoo,Arch）可能默认没有安装Python 2.x。这种情况下，需要安装Python 2.x，并且在`inventory`中设置`ansible_python_interpreter`变量来指向安装的Python 2.x版本。
>
> 如果需要给`myhost`组安装Python 2.x，可以使用如下方法

	ansible myhost --sudo -m raw -a "yum install -y python2 python-simplejson"

# 安装控制台

Ansible非常容易从源代码checkout出来安装，并且不需要root权限。实际上不需要安装包，也不需要服务或者数据库设置。所以，很多用户是直接从Ansible的软件仓库中checkout最新的开发版本

	git clone git://github.com/ansible/ansible.git --recursive
	cd ./ansible

使用Bash的话执行如下命令

	source ./hacking/env-setup

如果你希望去除不需要的告警和错误，则使用

	source ./hacking/env-setup -q

如果Python环境中没有安装`pip`，则需要安装

	sudo easy_install pip

Ansible也使用如下模块，需要安装

	sudo pip install paramiko PyYAML Jinja2 httplib2 six

当需要更新ansible的时候，要注意不仅需要更新源代码，而且需要更新`submodules`

	git pull --rebase
	git submodule update --init --recursive

当运行了`env-setup`脚本，默认的清单文件是`/etc/ansible/hosts`，也可以指定清单文件，例如

	echo "127.0.0.1" > ~/ansible_hosts
	export ANSIBLE_INVENTORY=~/ansible_hosts

按照上述步骤完成Ansible之后，可以通过`ping`命令测试

	ansible all -m ping --ask-pass

# 通过Yum安装

[EPEL](http://fedoraproject.org/wiki/EPEL) 6,7 提供了RPM包，也支持Fedora发行版。

在CentOS 7上安装EPEL

	yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

安装Ansible

	yum install ansible

也可以自己构建`rpm`包，在Ansible的源代码中使用如下方法构建：

	git clone git://github.com/ansible/ansible.git --recursive
	cd ./ansible
	make rpm
	sudo rpm -Uvh ./rpm-build/ansible-*.noarch.rpm

# 通过Apt安装（Ubuntu）

Ubuntu的发行包通过[PPA](https://launchpad.net/~ansible/+archive/ansible)安装

	sudo apt-get install software-properties-common
	sudo apt-add-repository ppa:ansible/ansible
	sudo apt-get update
	sudo apt-get install ansible

同样，也可以在源代码上构建`deb`

	make deb

# 通过Portage安装(Gentoo)

	emerge -av app-admin/ansible

要安装最新版本，可能需要unmask

	echo 'app-admin/ansible' >> /etc/portage/package.accept_keywords

# 在Mac OS X上安装

> 我的个人工作平台是Mac OS X 10.11，以下实践记录

在Mac OS X平台，请使用`pip`进行安装

	sudo easy_install pip

然后就可以安装Ansible

	sudo pip install ansible

