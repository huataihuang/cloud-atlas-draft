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

# 重建virtualenv中python

当操作系统的python版本升级之后，virtualenv中的python依赖的库文件可能不存在了，这样就导致sphinx运行 `make html` 等命令报错：

```
error while loading shared libraries: libpython3.7m.so.1.0: cannot open shared object file: No such file or directory
```

参考 [VirtualEnv issue after update to Python 3.7](https://forum.manjaro.org/t/virtualenv-issue-after-update-to-python-3-7/55462) 有几种解决方法：

- 重建virtualenv环境
- 在创建virtualenv环境是使用 `--always-copy` 参数，这样就会复制库文件到virtualenv中，而不是仅仅创建软链接
- 使用pyenv，就可以安装不同的python版本，然后mkvirtualenv指向特定的python版本

我决定结合方法一和方法二，首先重建virtualenv环境，并且在重建virtualenv环境时复制库文件，避免下次操作系统升级影响virtualenv。

## 重建Virtualenv

> 注意：由于系统升级导致无法运行virtualenv中的python，可以临时采用手工创建软链接来解决。也就是既然操作系统从 Python 3.7 升级到 Python 3.8 导致了virtualenv中库文件软链接找不到原先的 Python 3.7 库文件。我尝试做了库文件软链接

```
sudo ln -s /usr/lib/libpython3.8.so.1.0 /usr/lib/libpython3.7m.so.1.0
```

但是运行python程序还是出现报错:

```
/home/huatai/venv3/bin/python: symbol lookup error: /home/huatai/venv3/bin/python: undefined symbol: _Py_UnixMain
```

所以，我决定先回滚到3.7m版本，通过先备份当前virtualenv中运行的软件包，然后再升级Python，升级以后，立即重建virtualenv（使用新版本），并恢复安装包。

* 参考 [Arch Linux 社区文档 - Downgrading packages](https://wiki.archlinux.org/index.php/downgrading_packages) 可以通过本地 `pacman cache` 现存的以前版本软件包降级系统当前版本，例如，在该目录下有:

```
python-3.7.4-2-x86_64.pkg.tar.xz
python-3.8.0-1-x86_64.pkg.tar.xz
```

其中 3.8.0-1 就是当前版本(引起我的Python virtualenv出错)，而 3.7.4-2 就是上一个正确版本。所以我要回滚到上一个 3.7.4-2

```
sudo pacman -U /var/cache/pacman/pkg/python-3.7.4-2-x86_64.pkg.tar.xz
```

回滚以后，在 `virtualenv` 环境中验证 Sphinx 已经可以正常工作。则开始重建Python Virtualenv环境。

* 注意，首先要激活Virtualenv，然后用 `requirements.txt` 文件记录下virtualenv中使用的软件包

```
. ~/venv3/bin/activate
```

```
pip3.7 freeze > ~/venv3/requirements.txt
```

* 关闭virtualenv

```
deactivate
```

* 移除(备份)旧virtualenv:

```
mv ~/venv3 ~/venv3.bak
```

* 这里附加一个 `pacman -Syu` 再次将Python版本升级到 3.8 （因为实际系统中很多工具已经升级为3.8）

* 创建新的virtualenv

```
cd ~
virtualenv --always-copy venv3
```

* 重新安装packages

```
. ~/venv3/bin/activate
pip install -r ~/venv3.bak/requirements.txt
```

此外，可以参考 [Pip upgrade all packages at once with a one-liner command](https://simpleit.rocks/python/upgrade-all-pip-requirements-package-console-commands/) 升级virtualenv中所有安装

```
pip3 list -o --format columns|  cut -d' ' -f1|xargs -n1 pip install -U
```

# 参考

* [How to install pip in CentOS 7?](https://stackoverflow.com/questions/32618686/how-to-install-pip-in-centos-7)
* [How do I remove packages installed with Python's easy_install?](https://stackoverflow.com/questions/1231688/how-do-i-remove-packages-installed-with-pythons-easy-install)