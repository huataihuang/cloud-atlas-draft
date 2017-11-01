`pip`是使用Python编写的用语软件包安装和管理的包管理器。很多软件包都可以通过[Python Package Index](https://pypi.python.org/pypi)（PyPI）来找到。

Python 2.7.9开始包含了pip（在Python 3中是`pip3`）。

# 操作命令

## 系统级别安装pip

* Red Hat系列安装pip

```bash
sudo yum -y install python-pip
```

> 参考[Linux: Install pip Client To Install Python Packages](http://www.cyberciti.biz/faq/debian-ubuntu-centos-rhel-linux-install-pipclient/)

* Debian系列安装pip

```bash
sudo apt-get install python-pip
```

> 参考[How to install pip on CentOS / RHEL / Ubuntu / Debian](http://sharadchhetri.com/2014/05/30/install-pip-centos-rhel-ubuntu-debian/)

* 通过脚本命令安装

```bash
curl https://bootstrap.pypa.io/get-pip.py | python
```

## 个人用户环境安装pip

如果用户没有root权限，或者不能修改系统级别的Python安装，则可以通过以下方法在个人工作目录下部署Python工作环境

> 对于线上部署，建议使用非root账号部署应用，采用`virtualenv`是最佳选择

### 安装virtualenv

```bash
curl -O https://raw.github.com/pypa/virtualenv/master/virtualenv.py
```
创建虚拟环境

```bash
python virtualenv.py py_virtual
```

激活虚拟环境

```bash
. py_virtual/bin/activate
```

参考[Linux: Install pip Client To Install Python Packages](http://www.cyberciti.biz/faq/debian-ubuntu-centos-rhel-linux-install-pipclient/)

Debian/Ubuntu也提供了发行版本的`virtualevn`包

```bash
sudo apt-get install python-virtualenv
```

在Debian `Jessie`版本中，安装`python-virtualenv`会安装`Python 3.4`软件包，这个工具包是同时兼容Python 2和Python 3的。要建立Python 2 或 Python 3的虚拟环境，主要通过参数来区别

* `Python 2`虚拟环境

```bash
virtualenv venv2
```

* `Python 3`虚拟环境

```bash
virtualenv -p python3 venv3
```

要退出虚拟环境输入以下命令

```bash
deactivate
```

> 参考 [Using Python 3 in virtualenv](http://stackoverflow.com/questions/23842713/using-python-3-in-virtualenv)

如果使用Mac OS X，使用`easy_install`来安装`virtualenv`

```bash
sudo easy_install virtualenv
```

## Red Hat系列安装pip

要安装软件包

	pip install some-package-name

卸载也很方便

	pip uninstall some-package-name

最重要的`pip`功能是可以管理所有包列表并且相应的版本，即通过一个"requirements"文件。这个文件可以有效地在一个隔离环境中（如其他主机）或虚拟环境中重建整个软件包组。

	pip install -r requirements.txt

对于一些特定版本的python，可以用指定版本号来跟随`pip`，如`${version}`替换成`2`,`3`,`3.4`等

	pip${version} install some-package-name

> 古老而稳定并且已经End of Life的CentOS 5系列，操作系统的默认是[Python版本2.4.3，对于Django"不友好"需要安装Python 2.7](../django/startup/quick_install_django)，但是即使是EPEL也只提供Python 2.6版本。
>
> 参考[在古老的CentOS 5上安装Python 5以及virtualenv环境](install_python_2.7_and_virtualenv_in_centos_5)实践笔记。

# 参考

* [pip (package manager)](https://en.wikipedia.org/wiki/Pip_%28package_manager%29)