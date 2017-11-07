我们知道Django提供了非常方便添加新的app到rpoject的方法：

```
django-admin.py startproject myapp .   # 注意这里有一个.
cd myapp
django-admin.py startapp first_app
```

但是，如何完整删除掉已经创建的`first_app`呢？

* Django提供了一个SQL删除掉app的所有表的功能：

```
./manage.py sqlclear my_app_name
```

* 编辑`settings.py`文件，移除`INSTALLED_APPS`中有关app的内容
* 如果不再需要app的文件，则从项目目录下删除掉`my_app_name`目录
* 如果app保存了媒体文件，缓存文件或其他临时文件，需要自行删除
* 其他需要清理的内容分别在：
  * views.py,, admin.py, models.py, urls.py
* 执行

```
python manage.py migrate
python manage.py syncdb
```

# 参考

* [Django: How to completely uninstall a Django app?](https://stackoverflow.com/questions/3329773/django-how-to-completely-uninstall-a-django-app)