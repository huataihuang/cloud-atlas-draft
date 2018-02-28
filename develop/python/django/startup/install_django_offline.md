在线上服务器部署Django的时候，不可能将所有服务器都连接到internet，然后通过pip进行联网安装。

# 离线安装Django以及相关软件模块

* 首先在一个可以连接internet的开发测试环境，在[一个Python虚拟环境安装Django以及所有相关包](quick_install_django)，

* 在已经具备好所有运行模块的Django环境中执行以下命令列出所有安装的包和版本：

```
pip freeze > requirements.txt
```

* 使用以下命令为模块包构建一个`wheelhouse`目录

```
pip wheel -r requirements.txt -w wheelhouse
```

> 注意：如果没有`-w wheelhouse`参数，则默认在当前目录下构建wheels - 参考 [pip wheel](https://pip.pypa.io/en/stable/reference/pip_wheel/)

* 压缩`wheelhouse`目录

```
zip -r wheelhouse.zip wheelhouse
```

* 将上述压缩包`wheelhouse.zip`复制到目标服务器上，然后先切换到`virtuanlenv`环境 - 这里假设已经参考[在古老的CentOS 5上安装Python 2.7以及virtualenv环境](install_python_2.7_and_virtualenv_in_centos_5)构建好了Python运行虚拟环境`venv2`，则按照下面步骤执行

```
source venv2/bin/activate
unzip wheelhouse.zip
pip install wheelhouse/*
```

# pip install `wheelhouse`的异常排查

## `pip`版本过低导致安装失败

这里遇到一个报错：

```
Exception:
Traceback (most recent call last):
  File "/home/admin/venv2/lib/python2.7/site-packages/pip-1.2.1-py2.7.egg/pip/basecommand.py", line 107, in main
    status = self.run(options, args)
  File "/home/admin/venv2/lib/python2.7/site-packages/pip-1.2.1-py2.7.egg/pip/commands/install.py", line 225, in run
    InstallRequirement.from_line(name, None))
  File "/home/admin/venv2/lib/python2.7/site-packages/pip-1.2.1-py2.7.egg/pip/req.py", line 118, in from_line
    return cls(req, comes_from, url=url)
  File "/home/admin/venv2/lib/python2.7/site-packages/pip-1.2.1-py2.7.egg/pip/req.py", line 43, in __init__
    req = pkg_resources.Requirement.parse(req)
  File "/home/admin/venv2/lib/python2.7/site-packages/setuptools-0.6c11-py2.7.egg/pkg_resources.py", line 2510, in parse
    reqs = list(parse_requirements(s))
  File "/home/admin/venv2/lib/python2.7/site-packages/setuptools-0.6c11-py2.7.egg/pkg_resources.py", line 2436, in parse_requirements
    line, p, specs = scan_list(VERSION,LINE_END,line,p,(1,2),"version spec")
  File "/home/admin/venv2/lib/python2.7/site-packages/setuptools-0.6c11-py2.7.egg/pkg_resources.py", line 2404, in scan_list
    raise ValueError("Expected "+item_name+" in",line,"at",line[p:])
ValueError: ('Expected version spec in', 'wheelhouse/certifi-2017.11.5-py2.py3-none-any.whl', 'at', '/certifi-2017.11.5-py2.py3-none-any.whl')

Storing complete log in /home/admin/.pip/pip.log
```

参考 [ValueError “Expected version spec” when installing local wheel via pip](https://stackoverflow.com/questions/28502283/valueerror-expected-version-spec-when-installing-local-wheel-via-pip)，原因是当前的`pip`版本太低导致的。

通过本地安装升级pip来解决上述问题，下载以下4个文件复制到offline主机上（`setuptools`有可能不需要），例如目录`/tmp/update_pip`：

* `get-pip.py` ( https://bootstrap.pypa.io/get-pip.py )
* `pip-9.0.1-py2.py3-none-any.whl` ( https://pypi.python.org/pypi/pip ) 
* `setuptools-37.0.0-py2.py3-none-any.whl` ( https://pypi.python.org/pypi/setuptools )
* `wheel-0.30.0-py2.py3-none-any.whl` ( https://pypi.python.org/pypi/wheel )

```
get-pip.py
pip-9.0.1-py2.py3-none-any.whl
setuptools-37.0.0-py2.py3-none-any.whl
wheel-0.30.0-py2.py3-none-any.whl
```

执行以下命令升级pip

```
python get-pip.py --no-index --find-links=/tmp/update_pip
```

可以看到升级了Python虚拟环境中的`pip`和`wheel`

```
Collecting pip
Collecting wheel
Installing collected packages: pip, wheel
  Found existing installation: pip 1.2.1
    Uninstalling pip-1.2.1:
      Successfully uninstalled pip-1.2.1
Successfully installed pip-9.0.1 wheel-0.30.0
```

然后再次执行`pip install wheelhouse/*`即可以成功。

## `XXXX.whl is not a supported wheel on this platform`

在执行`pip install wheelhouse/*`的时候，有些包安装会提示错误，例如：

```
MarkupSafe-1.0-cp27-cp27mu-linux_x86_64.whl is not a supported wheel on this platform.
```

开始我以为是操作系统不同，实际对比了操作系统版本完全一致。差别只是Python版本，目标服务器的Python版本较低是 2.7.8，而源服务器的Python版本是2.7.14。但是，相同的大版本2.7，应该是通用才对啊。

参考 [pip安装报错：is not a supported wheel on this platform](https://www.cnblogs.com/nice-forever/p/5371906.html) 和 [Cannot install numpy from wheel format](https://stackoverflow.com/questions/28107123/cannot-install-numpy-from-wheel-format?rq=1)，可以通过以下命令来验证兼容的关键字

```
import pip; print(pip.pep425tags.get_supported())
```

由于其中没有包含`cp27mu`所以导致拒绝安装。(`cp`表示`CPython`)

实际上可以通过重新命名`.whl`包名字来绕开这个问题：

```
mv MarkupSafe-1.0-cp27-cp27mu-linux_x86_64.whl MarkupSafe-1.0-cp27-none-linux_x86_64.whl
```

然后就可以正常安装和使用了。

## Python `mysqlclient` 安装

上述`pip install wheelhouse/*`还有一个报错提示

```
mysqlclient-1.3.12-cp27-cp27mu-linux_x86_64.whl is not a supported wheel on this platform.
```

参考 https://pypi.python.org/pypi/mysqlclient/1.3.12 显示 mysqlclient-1.3.12 要求的MySQL版本如下：

> MySQL-5.5 through 5.7 and Python 2.7, 3.4+ are currently supported. PyPy is supported too.

检查服务器，发现只安装了`mysql-libs-5.5.17-1.el5.remi`，所以考虑升级MySQL

> [CentOS 5.7建议安装社区版本的MySQL 5.7](../../../../database/mysql/install_and_upgrade/install_mysql5.7_in_centos_5)

```
unzip mysql-5.7-community.zip
cd mysql-5.7-community

sudo rpm -e mysql-libs-5.5.17-1.el5.remi.x86_64 --nodeps
sudo rpm -ivh mysql*.rpm
```

然后下载源代码编译

```
tar xfz mysqlclient-1.3.12.tar.gz
cd mysqlclient-1.3.12
python setup.py install
```

> 通过源代码安装了`mysqlclient`之后，可以从`wheelhouse`目录下移除`mysqlclient-1.3.12-cp27-cp27mu-linux_x86_64.whl`

# 启动MySQL服务

```
/etc/init.d/mysqld start
```

如果数据库密码不正确，则执行[MySQL Root用户密码重置](../../../../database/mysql/troubleshooting/reset_mysql_root_password)

# 恢复Django应用

```
cd ~/django_project
```

* 执行检查和同步迁移数据库

```
python manage.py check
python manage.py migrate
```

* 运行django服务

```
python manage.py runserver 0.0.0.0:8000
```

# 参考

* [Installing Django and related packages on an offline computer](https://stackoverflow.com/questions/34704163/installing-django-and-related-packages-on-an-offline-computer)