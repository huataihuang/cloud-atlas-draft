> 对一个后端开发和运维人员而言，前端各种眼花缭乱的技术难免有些无从下手。如果自己手工写html和css，也很难作出美观的页面。那么，让擅长的人做擅长的事吧，我们专心作底层技术。

从 https://www.quackit.com/html/templates/ 可以下载到基于Bootstrap的模板，可以快速展开项目开发：

![django Portal模板](django_portal_template1.png)

下载模板 - 这里选择 Portal 1a (最上方菜单导航栏固定似乎比较容易转跳)

> 这里案例的项目名称是`dashboard`（控制台）

```
python manage.py startapp dashboard
```

修改项目目录`settings.py`添加

```
INSTALLED_APPS = [
...
    'dashboard',
]

```

上述模板包解压缩以后将`portal-1a`目录中的内容包括3个目录和一个index.html文件：

```
drwxr-xr-x 2 admin admin  87 Aug 30  2015 css
drwxr-xr-x 2 admin admin 209 Jun 30  2015 fonts
drwxr-xr-x 2 admin admin 155 Aug 31  2015 js
-rwxr-xr-x 1 admin admin 15K Nov 15 14:53 c
```

该如何使用这个模板呢？

* `index.html`存放到Django App目录的`templates`目录下
* `css  fonts  js`这3个目录存放到Django App目录的`static`目录下

此时还需要做配置才能使得Django加载对应的模板：

* 编辑`urls.py`添加索引文件配置

```python
from django.conf.urls import include, url
# from . import views  <= 注释掉这行，去除根目录下views，改为引用dashboard下的views
from dashboard import urls as dashboard_urls
from dashboard import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
]
```

* 编写`views.py`
* 为了使得django使用templates目录，需要在项目`settings.py`中设置添加`templates`目录：

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  #修改了这一行
```

并修改设置`STATIC_URL`部分：

```python
STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'static') #增加这一行
```

并安装这个定制的APP:

```python
INSTALLED_APPS = [
    ...
    'dashboard',
]
```

* 然后修改一下`index.html`将一些静态文件加载代码设置从`static`变量（也就是在`settings.py`中设置的）开始加载

头部修改

```html
        <title>PYTHON WORLD</title>
        {% load staticfiles %}
        <sript src="{% static "csrf.js" %}"></sript>
    <!-- Bootstrap Core CSS -->
    <link href="{% static "css/bootstrap.min.css" %}" rel="stylesheet">

    <!-- Custom CSS: You can use this stylesheet to override any Bootstrap styles and/or apply your own styles -->
    <link href="{% static "css/custom.css" %}" rel="stylesheet">
```

尾部修改

```html
    <!-- jQuery -->
    <script src="{% static "js/jquery-1.11.3.min.js" %}"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="{% static "js/bootstrap.min.js" %}"></script>

        <!-- IE10 viewport bug workaround -->
        <script src="{% static "js/ie10-viewport-bug-workaround.js" %}"></script>

        <!-- Placeholder Images -->
        <script src="{% static "js/holder.min.js" %}"></script>
```

以上完成后，再次访问项目APP就可以看到加载了美观的Bootstrap模板。

# 参考

* [django-cms（开发案例）](https://github.com/tuner24/django-cms)