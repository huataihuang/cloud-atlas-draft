# 安装Django REST framework

* 创建一个Django项目，名为`tutorial`，并且启动一个新的app名字叫`quickstart`

```
# Create the project directory
mkdir tutorial
cd tutorial

# Create a virtualenv to isolate our package dependencies locally
virtualenv env
source env/bin/activate  # On Windows use `env\Scripts\activate`

# Install Django and Django REST framework into the virtualenv
pip install django
pip install djangorestframework

# Set up a new project with a single application
django-admin.py startproject tutorial .  # Note the trailing '.' character
cd tutorial
django-admin.py startapp quickstart
cd ..
```

上述命令已经完成了django目录初始化

* 首次同步数据库

```
python manage.py migrate
```

在CentOS 5.11环境下，由于使用的是sqlite 3.3.6，则会出现以下报错

> 如果使用sqlite 3.8.11则不会出现该问题

```
Traceback (most recent call last):
  File "manage.py", line 22, in <module>
    execute_from_command_line(sys.argv)
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/core/management/__init__.py", line 364, in execute_from_command_line
    utility.execute()
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/core/management/__init__.py", line 356, in execute
    self.fetch_command(subcommand).run_from_argv(self.argv)
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/core/management/base.py", line 283, in run_from_argv
    self.execute(*args, **cmd_options)
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/core/management/base.py", line 330, in execute
    output = self.handle(*args, **options)
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/core/management/commands/migrate.py", line 83, in handle
    executor = MigrationExecutor(connection, self.migration_progress_callback)
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/db/migrations/executor.py", line 20, in __init__
    self.loader = MigrationLoader(self.connection)
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/db/migrations/loader.py", line 52, in __init__
    self.build_graph()
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/db/migrations/loader.py", line 209, in build_graph
    self.applied_migrations = recorder.applied_migrations()
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/db/migrations/recorder.py", line 65, in applied_migrations
    self.ensure_schema()
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/db/migrations/recorder.py", line 56, in ensure_schema
    with self.connection.schema_editor() as editor:
  File "/home/admin/tutorial/env/lib/python2.7/site-packages/django/db/backends/sqlite3/schema.py", line 25, in __enter__
    self._initial_pragma_fk = c.fetchone()[0]
TypeError: 'NoneType' object has no attribute '__getitem__'
```

这个报错在[migrate and other commands fail with TypeError: 'NoneType' object has no attribute '__getitem__' in schema.py](https://code.djangoproject.com/ticket/26205?cversion=0&cnum_hist=2)说明：

Django 1.9使用sqlite3 v3.3.6时候会出现`PRAGMA foreign_keys`返回nothing，而不是0或者1。解决方法是修改 `django/db/backends/sqlite3/schema.py`

将

```python
self._initial_pragma_fk = c.fetchone()[0]
```

修改成

```python
self._initial_pragma_fk = 0  # c.fetchone()[0]
```

* 创建一个名为`admin`用户，使用密码`password123`

```
python manage.py createsuperuser
```

# 序列化

这里定义一些序列化：创建一个新的模块名为`tutorial/quickstart/serializers.py`用于数据表现：

```python
from django.contrib.auth.models import User, Group
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')
```

注意这里使用超链接`HyperlinkedModelSerializer`。可以使用主键和一些其他关系，不过超链接是一个良好的RESTful设计。

# 视图

现在定义一些视图，编辑`tutorial/quickstart/views.py`添加如下

```python
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from tutorial.quickstart.serializers import UserSerializer, GroupSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
```

和编写多个视图不同，这里将所有共有特性统一存放到`ViewSets`的类中。

# URLs

编写API URLs，则在 `tutorial/urls.py`

```python
from django.conf.urls import url, include
from rest_framework import routers
from tutorial.quickstart import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
```

由于使用viewsets取代views，可以通过简单在一个router类注册viewsets，这样从API自动生成URLs conf。

如果需要更多API URLs，可以简单通过使用常规基于类的视图，并明确编写URL conf。

最后，包含默认的登陆和登出视图用于浏览API，中国是可选的，但是如果API要求授权并且希望使用可浏览的API，则非常有用。

# 设置

设置一些全局设置，开启页码，并且希望API只被admin用户访问，在设置 `tutorial/settings.py`

```python
INSTALLED_APPS = (
    ...
    'rest_framework',
)

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAdminUser',
    ],
    'PAGE_SIZE': 10
}
```

> 以上完成所有测试代码编写

# 测试API

运行程序

```
python manage.py runserver
```

* 访问APU


```bash
curl -H 'Accept: application/json; indent=4' -u admin:password123 http://127.0.0.1:8000/users/
{
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
        {
            "email": "admin@example.com",
            "groups": [],
            "url": "http://127.0.0.1:8000/users/1/",
            "username": "admin"
        },
        {
            "email": "tom@example.com",
            "groups": [                ],
            "url": "http://127.0.0.1:8000/users/2/",
            "username": "tom"
        }
    ]
}
```

# 参考

* [Django REST framework Quickstart](http://www.django-rest-framework.org/tutorial/quickstart/)