`pip`是使用Python编写的用语软件包安装和管理的包管理器。很多软件包都可以通过[Python Package Index](https://pypi.python.org/pypi)（PyPI）来找到。

Python 2.7.9开始包含了pip（在Python 3中是`pip3`）。

# 操作命令

很多发行版已经安装了`pip`，如果没有安装可以通过如下命令快速完成

	curl https://bootstrap.pypa.io/get-pip.py | python

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