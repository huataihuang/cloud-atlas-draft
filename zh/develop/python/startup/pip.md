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

安装virtualenv

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

* Red Hat系列安装pip

要安装软件包

	pip install some-package-name

卸载也很方便

	pip uninstall some-package-name

最重要的`pip`功能是可以管理所有包列表并且相应的版本，即通过一个"requirements"文件。这个文件可以有效地在一个隔离环境中（如其他主机）或虚拟环境中重建整个软件包组。

	pip install -r requirements.txt

对于一些特定版本的python，可以用指定版本号来跟随`pip`，如`${version}`替换成`2`,`3`,`3.4`等

	pip${version} install some-package-name

# 参考

* [pip (package manager)](https://en.wikipedia.org/wiki/Pip_%28package_manager%29)