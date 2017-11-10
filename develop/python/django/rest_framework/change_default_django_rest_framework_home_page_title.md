Django REST framework没有提供直接默认的title的界面，需要通过模板来覆盖DRF的`base.html`:

* 首先将Django REST Framework的`base.html`模板文件复制到项目的`templates`完全对应目录下：

> 案例采用的是Python Virtualenv，目录为`$HOME/venv2`

```
cd <project_name>/<app_name>
mkdir templates/rest_framework

cp ~/venv2/lib/python2.7/site-packages/rest_framework/templates/rest_framework/base.html \
./templates/rest_framework/

cp ~/venv2/lib/python2.7/site-packages/rest_framework/templates/rest_framework/admin.html \
./templates/rest_framework/
```

* 修改[block template tag](https://docs.djangoproject.com/es/1.10/ref/templates/language/#template-inheritance)部分

> 暂时还没有实践成功，目前还是直接修改源文件。通过移除源文件观察发现其读取的文件目录比较特别（也是一种调试方法）

# 参考

* [Change default Django REST Framework home page title](https://stackoverflow.com/questions/38799315/change-default-django-rest-framework-home-page-title)