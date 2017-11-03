CentSO 5/RHEL 5是一个古老并且已经End Of Life的发行版，然而，依然有某些生产和测试环境在使用。对于Python/Django开发，操作系统相关性不高，主要涉及的是Python版本和MySQL版本要求，则需要部署符合要求的MySQL版本。

> **注意**
>
> CentOS 5默认的mysql版本只有5.05，使用MyISAM引擎，对于数据安全性缺乏保障。此外，发行版提供了一个`mysql55-mysql`版本，可以使用InnoDB引擎，适合生产环境。
>
> 但是，`mysql55-mysql`安装在`/opt/rh/mysql55/root`目录下，相关库文件和头文件都没有包含在默认编译路径中，会导致后续编译Python `mysqlclient` 模块非常麻烦（提示报错都在`_mysql.c`，即使安装了`mysql55-mysql-devel`也不能解决，因为头文件和库文件不在编译器搜索路径上），所以不推荐使用。

推荐使用MySQL官方（现在为Oracle收购）提供的yum软件库安装，从 https://dev.mysql.com/downloads/repo/yum/ 可以下载到对应操作系统版本的repo安装包，以下为安装过程：

```
wget --no-check-certificate https://dev.mysql.com/get/mysql57-community-release-el5-8.noarch.rpm

rpm -ivh mysql57-community-release-el5-8.noarch.rpm

yum install mysql-community-server mysql-community-client \
mysql-community-devel
```

> RHEL/CentOS 7默认使用MiraDB（MySQL的开源社区分支版本），已经足够稳定和优秀，和MySQL官方版本相当，所以可以直接使用发行版本的`miradb`，无需这样单独从MySQL官网安装。

在CentOS 5上完成以上MySQL安装部署之后，就可以通过以下步骤完成django环境部署：

* [在古老的CentOS 5上安装Python 5以及virtualenv环境](../../../develop/python/startup/install_python_2.7_and_virtualenv_in_centos_5)
* [快速安装Django](../../../develop/python/django/startup/quick_install_django)
* [使用MySQL作为Django数据库](../../../develop/python/django/startup/use_mysql_with_django)