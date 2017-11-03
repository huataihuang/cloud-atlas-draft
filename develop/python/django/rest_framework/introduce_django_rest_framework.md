# 运行要求

REST framework运行要求：

* Python (2.7, 3.2, 3.3, 3.4, 3.5, 3.6)
* Django (1.10, 1.11, 2.0 alpha)

以下包可选：

* coreapi (1.32.0+) - Schema generation support.
* Markdown (2.1.0+) - Markdown support for the browsable API.
* django-filter (1.0.1+) - Filtering support.
* django-crispy-forms - Improved HTML display for filtering.
* django-guardian (1.1.1+) - Object level permissions support.

# 安装

> 建议采用[快速安装Django](../startup/quick_install_django)相同的方式，通过pip安装virtualenv，然后建立python虚拟运行环境，再安装相应的组件：

```
pip install virtualenv
virtualenv venv
source venv/bin/activate
```

在虚拟运行环境中，针对项目进行安装

```
pip install djangorestframework
pip install markdown       # Markdown support for the browsable API.
pip install django-filter  # Filtering support
```

也可以从github clone出这个项目进行安装

```
git clone git@github.com:encode/django-rest-framework.git
```

# 创建项目

* 使用标准django方式创建项目

```
# Set up a new project with a single application
django-admin.py startproject tutorial .
cd tutorial
django-admin.py startapp quickstart
cd ..
```

上述命令已经完成了django目录初始化

* 首次同步数据库

```
python manage.py migrate
```