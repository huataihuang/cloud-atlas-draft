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

> 如果使用MySQL或者PostgreSQL数据库后端（默认是sqlite3），则参考[使用MySQL作为Django数据库](../startup/use_mysql_with_django)设置。

* 启用Django REST framework

编辑修改`tutorial/settings.py`的`INSTALLED_APPS`段落

```python
INSTALLED_APPS = (
    ...
    'rest_framework',
)
```

并在`settings.py`中添加

```python
REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ]
}
```

* 如果要浏览API，则可以添加REST frameworks的登陆账号视图（login and logout iews），则添加以下内容到`urls.py`文件：

```python
from django.conf.urls import url, include   # 添加 import include
from django.contrib import admin
from rest_framework import routers  # 添加 import routers
from tutorial.quickstart import views   # 添加 import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))  # 添加rest_framework.ruls导入
]
```

注意上述URL路径可以任意，但是必须以`rest_framework`名字空间（namespace）包括`rest_framework.urls`。在Django 1.9+可以忽略namespace，但是REST framework会帮你设置。