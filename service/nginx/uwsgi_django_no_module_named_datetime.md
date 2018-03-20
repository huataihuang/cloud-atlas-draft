在将Docker容器从主机A迁移到主机B之后，启动uwsgi服务后发现有报错

```
*** Operational MODE: preforking ***
Traceback (most recent call last):
  File "./my_django_app/wsgi.py", line 12, in <module>
    from django.core.wsgi import get_wsgi_application
  File "/home/admin/venv2/lib/python2.7/site-packages/django/__init__.py", line 3, in <module>
    from django.utils.version import get_version
  File "/home/admin/venv2/lib/python2.7/site-packages/django/utils/version.py", line 3, in <module>
    import datetime
ImportError: No module named datetime
unable to load app 0 (mountpoint='') (callable not found or import error)
*** no app loaded. going in full dynamic mode **
```

照理Docker容器迁移应该时完全一致才对，为何会出现找不到模块`datetime`呢？

此外，通过WEB访问显示错误`Internal Server Error`

> 尝试了两次迁移Docker容器，出现的报错信息完全一样。

# 排查

* 去除uwsgi，直接通过Django访问是正常的

```
python manage.py runserver 0:8000
```

是什么原因导致的加载错误？

> 容器从主机A迁移到主机B，由于主机B上的用户uid/gid和主机A迁移过来的容器中uid/gid不同同，我曾经做过一次[通过工具usermod和groupmod修改用户帐号名/uid/gid](../../develop/shell/utilities/usermod_groupmod)
>
> 不过，第二次尝试迁移Docker容器，没有执行过更改用户uid/gid，一样报错。

* 尝试手工启动uwsgi:（`my_django_app`是Django项目）

```
cd my_django_app

uwsgi --socket /home/admin/venv2/sock --chmod-socket=664
```

有提示信息

```
*** Operational MODE: single process ***
*** no app loaded. going in full dynamic mode ***
*** uWSGI is running in multiple interpreter mode ***
```

访问web，再次出现`Internal Server Error`

参考 [Serving Flask with Nginx](http://vladikk.com/2013/09/12/serving-flask-with-nginx-on-ubuntu/) 

修改 `my_django_app_uwsgi.ini`

```ini
[uwsgi]

# Django-related settings
# the base directory (full path)
chdir           = /home/admin/my_django_app
# Django's wsgi file
app = my_django_app
module          = %(app)
# the virtualenv (full path)
home            = /home/admin/venv2

# process-related settings
# master
master          = true
# maximum number of worker processes
processes       = 10
# the socket (use the full path to be safe
socket          = /home/admin/venv2/sock
# ... with appropriate permissions - may be needed
# chmod-socket    = 664
# clear environment on exit
vacuum          = true
```

将其中的原先没有生效的段落（实际没有这个配置）

```
# Django's wsgi file
module          = my_django_app.wsgi
```

修改成

```ini
# Django's wsgi file
app = my_django_app
module          = %(app)
```

再次启动提示

```
*** Operational MODE: preforking ***
unable to load app 0 (mountpoint='') (callable not found or import error)
*** no app loaded. going in full dynamic mode ***
```

这个问题是因为参考[Flask and uWSGI - unable to load app 0 (mountpoint='') (callable not found or import error)](https://stackoverflow.com/questions/12030809/flask-and-uwsgi-unable-to-load-app-0-mountpoint-callable-not-found-or-im)

因为uWSGI期望的变量名是`application`，这个变量在`my_django_app/wsgi.py`中可以看到

```python
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_django_app.settings")

application = get_wsgi_application()
```

参考 [How to use Django with uWSGI](https://docs.djangoproject.com/en/2.0/howto/deployment/wsgi/uwsgi/) 应该修改成：

```ini
# Django's wsgi file
module          = my_django_app.wsgi:application
```

此时报错重新出现：

```
*** Operational MODE: preforking ***
Traceback (most recent call last):
  File "./my_django_app/wsgi.py", line 12, in <module>
    from django.core.wsgi import get_wsgi_application
  File "/home/admin/venv2/lib/python2.7/site-packages/django/__init__.py", line 3, in <module>
    from django.utils.version import get_version
  File "/home/admin/venv2/lib/python2.7/site-packages/django/utils/version.py", line 3, in <module>
    import datetime
ImportError: No module named datetime
unable to load app 0 (mountpoint='') (callable not found or import error)
*** no app loaded. going in full dynamic mode ***
```

应该是Django加载`datetime`模块问题，是否我迁移容器时候出现了数据丢失？


在`my_django_app_uwsgi.ini`中添加一行可以使得服务启动后后台运行，并生成日志

```ini
daemonize      = /home/admin/venv2/my_django_app.log
```

日志中报错同上

目前基本判断还是Docker迁移的问题，这次排查对daemonize方式运行uwsgi有了了解，另外摸索了Django的配置，看来官方文档配置是最准确的，还需要再改进改进。

# 重建virtualenv环境

[ImportError: No module named datetime](https://stackoverflow.com/questions/26031160/importerror-no-module-named-datetime)提到了解决方法，原因是操作系统升级以后导致的问题。

> 我的容器迁移应该没有操作系统变化才对。不过，virtualenv的环境中的python是2.7.14版本，而操作系统似乎升级过（当前是CentOS 5.11），python版本是2.4.3

```
mv ~/venv2 ~/venv2.bak

virtualenv venv2
source venv2/bin/activate
```

但是，我发现重新创建一次virtualenv虚拟环境，显示的Python版本依然是 2.7.14

* 重新从项目中获取需要的模块重新安装

参考了 [Rebuilding a Virtualenv](https://help.pythonanywhere.com/pages/RebuildingVirtualenvs/) 使用以下方法找出依赖的软件包：

```bash
source venv2.bak/bin/activate
cd my_project   # 进入项目目录
pip freeze > requirements.txt
```

然后重新安装需要的依赖

```
pip install -r requirements.txt
```

# 重新安装uwsgi

* 安装uWSGI

```
pip install uwsgi
```

# 其他模块安装

经过重建virtualenv，以及重新安装了uwsgi之后，确实可以正确运行了。不过，我也发现使用`pip freeze > requirements.txt`并没有完全包含所有使用的模块。例如，使用到的`django-url-filter`没有列出，手工安装

```
pip install django-url-filter
```

# 参考

* [ImportError: No module named datetime](https://stackoverflow.com/questions/26031160/importerror-no-module-named-datetime)