# 安装

* 通过PyPI安装：

```
pip install django-dash
```

> 此外需要安装一些依赖，否则执行`python manage.py startapp XXX`会提示缺少模块（具体依赖可以参考 [django-dash/examples/freeze.txt](https://github.com/barseghyanartur/django-dash/blob/stable/examples/freeze.txt)）：

```
pip install lipsum
pip install lorem-ipsum-generator
```



* 在Django设置`settings.py`中添加`INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    #...
    'dash',
    'dash.contrib.layouts.android',
    'dash.contrib.layouts.bootstrap2',
    'dash.contrib.layouts.windows8',
    'dash.contrib.plugins.dummy',
    'dash.contrib.plugins.image',
    'dash.contrib.plugins.memo',
    'dash.contrib.plugins.rss_feed',
    'dash.contrib.plugins.url',
    'dash.contrib.plugins.video',
    'dash.contrib.plugins.weather',
    'dashboard',
    #...
]
```

* 确保`TEMPLATE_CONTEXT_PROCESSORS`中有`django.core.context_processors.request`:

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request', # 注意这里
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

* 在`urls`模块中添加

```python
import dash

urlpatterns = [
    url(r'^dashboard/', include(dash.urls)),
    # django-dash RSS contrib plugin URLs:
    url(r'^dash/contrib/plugins/rss-feed/',
        include('dash.contrib.plugins.rss_feed.urls')),
    # django-dash public dashboards contrib app:
    url(r'^', include('dash.contrib.apps.public_dashboard.urls')),
    
    #url(r'^$', views.index, name='index'),
    #...
]
```

# 创建新的layout



# 参考

* [GitHub: django-dash](https://github.com/barseghyanartur/django-dash)