Django作为WEB开发框架，默认使用SQLite作为开发数据库。生产环境，则通常需要使用MySQL或者PostgreSQL。这里介绍在CentOS上部署完MySQL和Python+Django环境之后，如何转换到MySQL后端。

> Django使用mysql后端需要通过`pip`安装`mysqlclient`模块，这个编译安装过程依赖系统安装`mysql-devel`软件包。对于早期的CentOS 5，建议采用MySQL官方软件仓库在[CentOS 5安装MySQL 5.7](../../../../database/mysql/install_and_upgrade/install_mysql5.7_in_centos_5)，这样可以方便完成`mysqlclient`编译（官方MySQL安装路径的库文件和头文件可以直接被编译程序识别，其他非标准路径需要设置）

# 安装MySQL

## CentOS

* 通过MySQL官方仓库安装 https://dev.mysql.com/downloads/repo/yum/

```
wget --no-check-certificate https://dev.mysql.com/get/mysql57-community-release-el5-8.noarch.rpm

rpm -ivh mysql57-community-release-el5-8.noarch.rpm

yum install mysql-community-server mysql-community-client \
mysql-community-devel
```

> 对于CentOS/RHEL 5建议使用[MySQL官方仓库安装](https://dev.mysql.com/downloads/repo/yum/)安装；CentOS/RHEL 6及以上版本，建议使用发行版自带的MiraDB。这样可以确保`mysql-devel`库及头文件都在标准目录下，方便后续编译安装Python的`mysqlclient`。（高版本6/7也可直接使用发行版提供的`MySQL-python`）

* 执行初始化安全设置：

```
mysql_secure_installation
```

## macOS

在macOS上，要安装mysqlclient for django，需要首先通过`brew`安装mysql软件，设置环境后才能够使用`pip install mysqlclient`。否则会出现报错`EnvironmentError: mysql_config not found`:

> 在macOS平台使用Jetbrains的PyCharm来开发Django，需要安装对应的`mysqlclient`。安装方法参考[Install mysqlclient for Django Python on Mac OS X Sierra](https://stackoverflow.com/questions/43612243/install-mysqlclient-for-django-python-on-mac-os-x-sierra)

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew install mysql
source venv2/bin/activate
pip install mysqlclient
```

> 这里执行`source venv2/bin/activate`是为了激活Python virtualenv环境

# 准备数据库

> 参考 [创建MySQL数据库和授权](../../../../database/mysql/install_and_upgrade/create_mysql_database_and_grant_privilege) 生成一个用于Django应用的简单数据库

```sql
create database myappdb character set utf8;

grant usage on myappdb.* to myapp@'%' identified by 'MyPass';

grant all privileges on myappdb.* to myapp@'%';

flush privileges;
```

参考

* [django doc: database](https://docs.djangoproject.com/en/1.11/ref/databases/)
* [Django+Mysql安装配置详解(Linux)](http://www.cnblogs.com/zhangsir6/articles/3074588.html)

> Django支持MySQL 5.5或更高版本

# 安装MySQL Django adapter,mysqlclient

> 参考 [Part VII.b – Install and Configure MySQL for Django](http://www.marinamele.com/taskbuster-django-tutorial/install-and-configure-mysql-for-django)

* 准备python虚拟环境（注意：系统安装Python 2.7和pip）

```
pip install virtualenv
virtualenv venv2
source venv2/bin/activate

pip install mysqlclient
pip install django
```

* 创建django项目

```
mkdir myapp     # 这里创建目录是为了将manage.py包含到目录下，方便后续维护
cd myapp

django-admin.py startproject myapp .   # 注意这里有一个.
cd myapp

django-admin.py startapp first_app
```

> 这里初始花一个django项目（`startproject myapp .`），然后在这个项目下创建一个名为`first_app`的应用，这样后续就可以通过访问`first_app`来实现，并且不同功能模块可以划分到不同的应用下面。

* 配置`settings.py`数据库配置，参考[django databases](https://docs.djangoproject.com/en/1.11/ref/settings/#databases) - 默认是sqlite3，需要修改成MySQL配置

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'myappdb',
        'USER': 'myapp',
        'PASSWORD': os.getenv('MYSQL_PASSWORD'),
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}
```

> **`注意`**：这里将数据库密码明文存储在配置文件中是存在安全隐患的。解决的方法是采用环境变量替换。参考[MySQL password in Django](https://stackoverflow.com/questions/18299322/mysql-password-in-django)设置用户环境变量配置文件`~/.bash_profile`

```
export MYSQL_PASSWORD='MyPass'
```

将上述配置修改成

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'myappdb',
        'USER': 'myapp',
        'PASSWORD': 'MyPass',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}
```

> [Install and Configure MySQL for Django](http://www.marinamele.com/taskbuster-django-tutorial/install-and-configure-mysql-for-django)提供了另外一种基于django环境的设置方法（不依赖Linux/Unix shell环境）。

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

* [How To Create a Django App and Connect it to a Database](https://www.digitalocean.com/community/tutorials/how-to-create-a-django-app-and-connect-it-to-a-database)
* [How To Use MySQL or MariaDB with your Django Application on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-use-mysql-or-mariadb-with-your-django-application-on-ubuntu-14-04)
* [Install and Configure MySQL for Django](http://www.marinamele.com/taskbuster-django-tutorial/install-and-configure-mysql-for-django)
* [django databases](https://docs.djangoproject.com/en/1.11/ref/settings/#databases)