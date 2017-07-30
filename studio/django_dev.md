
| Django version | Python versions
| 1.11 | 2.7, 3.4, 3.5, 3.6 |
| 2.0 | 3.5+ |

> [How to get Django](https://www.djangoproject.com/download/) 中有关django supported versions说明，对于生产环境，建议采用LTS版本 1.11 以及预计2019年Q1发布2.2版本，可保持较长的产品生命周期。

# 安装django

* 采用EPEL提供的python 3.4

```
wge https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo rpm -ivh epel-release-latest-7.noarch.rpm
sudo yum install python34
sudo yum install python34-setuptools
sudo easy_install-3.4 pip
```

* 安装virtualenv

```
sudo pip3.4 install virtualenv
```

* 设置环境 - 使用普通用户身份

```
virtualenv venv
source venv/bin/activate
```

* 安装django

```
pip install Django
```

# 初始化django

> 这里`~/works`参考[共享目录](nfs_and_share)，是物理服务器上共享的NFS目录（可以通过vm访问）也是对外sshfs共享目录，方便远程访问开发。

```
cd ~/works
django-admin startproject mysite
```

* 运行django

```
cd mysite
python manage.py runserver 0:8000
```

> 这里增加`0:8000`参数是为了在所有接口上监听，这样方便远程访问验证

> 注意：在CentOS 7上默认开启了firewall防火墙，要能够让外部访问，需要执行如下命令

```
sudo firewall-cmd --zone=public --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

# 参考

* [快速安装Django](../develop/python/django/startup/quick_install_django)