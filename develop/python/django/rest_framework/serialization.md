> 本文是创建一个简单的pastebin代码高亮Web API

# 准备新环境

* 安装

```python
virtualenv env
source env/bin/activate

pip install django
pip install djangorestframework
pip install pygments  # We'll be using this for the code highlighting
```

* 创建项目

```
django-admin.py startproject tutorial
cd tutorial

python manage.py startapp snippets
```

> 这里采用的目录结构是`project`和`app`并列。有关Django目录结构和风格，参考[Django项目代码架构风格](../startup/structure_django_project)

* 现在添加`snippets` app 和 `rest_framework` app 到 `INSTALLED_APPS`，即编辑`tutorial/settings.py`

```python
INSTALLED_APPS = (
    ...
    'rest_framework',
    'snippets.apps.SnippetsConfig',
)
```

> 注意：如果Django < 1.9，则需要将上面的`snippets.apps.SnippetsConfig`替换成`snippets`。

# 创建一个用于工作的模型（a model to work with）

* 首先创建一个简单的`snippet`模型用于存储代码片段（code snippets）。编辑`snippets/models.py`

```python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
from pygments.lexers import get_all_lexers
from pygments.styles import get_all_styles

LEXERS = [item for item in get_all_lexers() if item[1]]
LANGUAGE_CHOICES = sorted([(item[1][0], item[0]) for item in LEXERS])
STYLE_CHOICES = sorted((item, item) for item in get_all_styles())

class Snippet(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100, blank=True, default='')
    code = models.TextField()
    linenos = models.BooleanField(default=False)
    language = models.CharField(choices=LANGUAGE_CHOICES, default='python', max_length=100)
    style = models.CharField(choices=STYLE_CHOICES, default='friendly', max_length=100)

    class Meta:
        ordering = ('created',)
```

然后创建一个snippet模型初始化的迁移，并首次同步数据库

```
python manage.py makemigrations snippets
python manage.py migrate
```

# 创建一个序列化类



# 参考

* [Django REST framework Tutorial 1: Serialization](http://www.django-rest-framework.org/tutorial/1-serialization/)