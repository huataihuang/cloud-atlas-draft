本文是快速最小化安装Django指南，详细安装指南参考[complete installation guide](https://docs.djangoproject.com/en/1.11/topics/install/)。

# 安装Python

django运行需要使用的版本见[What Python version can I use with Django?](https://docs.djangoproject.com/en/1.11/faq/install/#faq-python-version-support)：

| Django version | Python versions
| 1.8 | 2.7, 3.2 (until the end of 2016), 3.3, 3.4, 3.5 |
| 1.9, 1.10 | 2.7, 3.4, 3.5 |
| 1.11 | 2.7, 3.4, 3.5, 3.6 |
| 2.0 | 3.5+ |

当前在CentOS7上默认安装是`2.7.5`，并且EPEL可安装Python最高版本是3.4，恰好不能支持django 2.0。手工编译安源代码在系统移植上比较麻烦，且2.0还处于preview阶段（预计2017年底发布），所以当前采用以下组合：

* Python 3.4
* Django 1.11 (长期支持版本至2020年Q1)

参考 [How to get Django](https://www.djangoproject.com/download/) 中有关django supported versions说明，对于生产环境，建议采用LTS版本 1.11 以及预计2019年Q1发布2.2版本，可保持较长的产品生命周期。

[Django发布线路图](../../../../img/develop/python/django/startup/django-release-roadmap.png)

当前[django官方文档](https://docs.djangoproject.com/)以1.11版本为基准，所以开发使用1.11文档比较齐全。

采用Python 3.4运行Django可以使得后续升级到Django 2.2时Python版本语法无需重大转换。

> 以下安装采用EPEL提供的python 3.4

```
wge https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo rpm -ivh epel-release-latest-7.noarch.rpm
sudo yum install python34
sudo yum install python34-setuptools
sudo easy_install-3.4 pip
```

安装virtualenv- 参考[virtualenv installation](https://virtualenv.pypa.io/en/stable/installation/)

```
sudo pip3.4 install virtualenv
```

设置环境 - 使用普通用户身份 - 参考 [virtualenv User Guide](https://virtualenv.pypa.io/en/stable/userguide/)

```
virtualenv venv
source venv/bin/activate
```

> 这里`venv`是创建虚拟环境的目录
>
> 此时已经激活虚拟环境，就可以使用`python`和`pip`，无需在指定版本，可以可以操作系统全局安装版本区分。

安装django

```
pip install django
```

## 安装django 2.0所需python3.5+ （备选参考）

> 如果需要测试运行django 2.0，可以参考 digitalocean 网站的 [How To Install Python 3 and Set Up a Local Programming Environment on CentOS 7](https://www.digitalocean.com/community/tutorials/how-to-install-python-3-and-set-up-a-local-programming-environment-on-centos-7) 使用ISU提供的最新版本

```
sudo yum -y update
sudo yum -y install yum-utils
sudo yum -y groupinstall development  #需要开发工具包来编译源代码
sudo yum -y install https://centos7.iuscommunity.org/ius-release.rpm
sudo yum -y install python36u
sudo yum -y install python36u-pipn
```

然后可以设置`venv`虚拟环境

```
mkdir environments
cd environments
python3.6 -m venv my_env
source my_env/bin/activate
```

激活虚拟环境之后，就可以使用`python`代替`python3.6`，以及使用`pip`代替`pip3.6`，方便进行开发。

> 有关在生产环境部署 Nginx+uWSGI+Django 方法参考 [设置Django和Nginx uWSGI](../../../../service/nginx/setup_django_with_uwsgi_nginx.md)

# 参考

* [django Documentation - Quick install guide](https://docs.djangoproject.com/en/1.11/intro/install/)
* [How to install pip with Python 3?](https://stackoverflow.com/questions/6587507/how-to-install-pip-with-python-3)