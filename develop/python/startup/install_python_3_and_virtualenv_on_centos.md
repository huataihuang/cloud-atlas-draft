EPEL提供了python 3.6 for centos，所以先安装EPEL软件库：

```
sudo rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

安装Python3:

```
sudo yum install python36 python36-devel
```

注意：安装了Python 3.6之后，并没有包含pip3，并且在EPEL软件仓库中也搜索不到 `python36-pip` 关键字，这会让人摸不着头脑。

## （废弃）通过 `easy_install` 安装 `pip`

原来，类似macOS平台(通过brew安装)也是使用 `easy_install` 实现安装pip3的，这个工具包含在 `python36-setuptools` 中，所以只要按章了 `python36-setuptools` 就得到了 `easy_install`

```
sudo yum install python36-setuptools
```

然后通过 `easy_install` 来安装pip3

```
sudo easy_install-3.6 pip
```

如果有以下报错，应该是 python 3.6的包安装 `/usr/bin` 而不是 `/usr/local/bin` ，这导致了easy_install不能找到`/usr/local/lib/python3.6/site-packages`（实际是`/usr/lib/python3.6/site-packages`）

```
error: can't create or remove files in install directory

The following error occurred while trying to add or remove files in the
installation directory:

    [Errno 2] No such file or directory: '/usr/local/lib/python3.6/site-packages/test-easy-install-64415.write-test'

The installation directory you specified (via --install-dir, --prefix, or
the distutils default setting) was:

    /usr/local/lib/python3.6/site-packages/

This directory does not currently exist.  Please create it and try again, or
choose a different installation directory (using the -d or --install-dir
option).
```

则采用指定安装目录：

```
sudo easy_install-3.6 --install-dir /usr/bin pip
```

折腾完上述步骤之后，系统就具有了pip3，则可以通过pip3 来安装virtualenv（不过实际最好还是通过直接安装 pip 为好，不要使用setuptools）

```
pip3 install virtualenv
```

另外，`easy_install`卸载模块的方法是：

先移除这个包的所有依赖

```
easy_install -m [PACKAGE]
```

然后再删除包的egg文件：

```
sudo rm -rf /usr/local/lib/python2.X/site-packages/[PACKAGE].egg
```

## 通过pypi提供的`get-pip.py`安装pip3（推荐）

**不过，参考[How do I remove packages installed with Python's easy_install?](https://stackoverflow.com/questions/1231688/how-do-i-remove-packages-installed-with-pythons-easy-install)，因该直接使用 [pip](http://pypi.python.org/pypi/pip/)代替`setuptools/easy_install`**

* 安装 `pip3`

```
wget https://bootstrap.pypa.io/get-pip.py
python3.6 get-pip.py
```

> 如果使用 `python get-pip.py` 则安装的是 `pip2`

# 安装virtualenv

```
pip3 install virtualenv
```

然后创建虚拟环境

```
cd ~
virtualenv venv3
. venv3/bin/activate
```

> 接下来可以安装sphinx

```
pip install sphinx
pip install sphinx_rtd_theme
```

# 参考

* [How to install pip in CentOS 7?](https://stackoverflow.com/questions/32618686/how-to-install-pip-in-centos-7)
* [How do I remove packages installed with Python's easy_install?](https://stackoverflow.com/questions/1231688/how-do-i-remove-packages-installed-with-pythons-easy-install)