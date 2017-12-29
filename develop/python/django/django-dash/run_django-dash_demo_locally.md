> 刚开始参考[django-dash](https://github.com/barseghyanartur/django-dash)官方文档[使用django-dash快速构建控制台](build_dashboard_with_django-dash)，发现其中的构建部分执行有些问题，所以决定先采用官方的example来运行，对比排查。

# 快速步骤

* 下载脚本

```bash
wget https://raw.github.com/barseghyanartur/django-dash/stable/examples/django_dash_example_app_installer.sh
```

* 执行

```bash
chmod +x django_dash_example_app_installer.sh

./django_dash_example_app_installer.sh
```

# 手工安装步骤

* 创建virtual环境：

```
virtualenv dash

source dash/bin/activate
```

* 下载最新稳定版本django-dash

```
wget https://github.com/barseghyanartur/django-dash/archive/stable.tar.gz
```

* 解压缩

```
mv stable stable.tar.gz
tar -xvf stable.tar.gz
```

* 进入解压缩的目录

```
cd django-dash-stable
```

* 安装Django以及依赖

```
pip install Django

pip install -r examples/requirements.txt

pip install https://github.com/barseghyanartur/django-dash/archive/stable.tar.gz
```

* 创建一些目录

```
mkdir -p examples/media/static/ examples/static/ examples/db/ examples/logs
```

* 复制 local_settings.example

```
cp examples/example/settings/local_settings.example examples/example/settings/local_settings.py
```

* 运行以下命令同步数据库，安装测试数据和运行服务：

```
# 这步看安装脚本已经不再需要了
# python examples/example/manage.py syncdb --noinput --traceback -v 3

python examples/example/manage.py migrate --noinput

python examples/example/manage.py collectstatic --noinput --traceback -v 3

python examples/example/manage.py news_create_test_data --traceback -v 3

python examples/example/manage.py dash_create_test_data --traceback -v 3

python examples/example/manage.py runserver 0.0.0.0:8001 --traceback -v 3
```

执行`manage.py migrate --noinput`报错

```
  File "/home/admin/venv2/lib/python2.7/site-packages/django/db/backends/sqlite3/schema.py", line 25, in __enter__
    self._initial_pragma_fk = c.fetchone()[0]
TypeError: 'NoneType' object has no attribute '__getitem__'
```

这个报错同[Django REST framework快速起步](../rest_framework/django_rest_framework_quickstart)是一样的解决方法，修改 `lib/python2.7/site-packages/django/db/backends/sqlite3/schema.py`

将

```python
self._initial_pragma_fk = c.fetchone()[0]
```

修改成

```python
self._initial_pragma_fk = 0  # c.fetchone()[0]
```

* 使用浏览器访问应用

```
Dashboard:

- URL: http://127.0.0.1:8001/en/dashboard/
- Admin username: test_admin
- Admin password: test

Django admin interface:

- URL: http://127.0.0.1:8001/en/administration/
- Admin username: test_admin
- Admin password: test
```

遇到问题：访问 http://127.0.0.1:8001/dashboard/ 出现报错：

```
The current path, dashboard/, didn't match any of these.
```

参考 https://github.com/barseghyanartur/django-dash/issues/18 原来文档没有更新，应该访问 http://127.0.0.1:8001/en/dashboard/

# 小结

* django-dash 有些复杂，主要是在页面的分隔上面，但是实际上对快速上手的dashboard，这块需求不是很高，主要是能够获得一个稳定美观的界面
* 没有达到预期的使用效果，还是出于比较简陋的使用界面，需要比较深入的定制开发