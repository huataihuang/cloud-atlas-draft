# 准备

* 检查django版本

```
python -m django --version
```

案例使用: Python 3.4 / Django 1.11.2

# 创建项目

```
django-admin startproject mysite
```

这个步骤将在当前目录下创建`mysite`目录。注意不要采用python或django内建的组件的名字，例如`django`或`test`之类保留字。

在Django中，不需要像PHP那样把代码保存在web服务器的document根目录（例如`/var/www`），对于Django这不是一个好习惯，存在被别人查看web上代码的风险。要将代码存放在存放在document根目录之外，例如`/home/mycode`。

以下是`startproject`命令创建的`mysite`目录内容

```
mysite
├── manage.py*  命令行交互工具
└── mysite/
    ├── __init__.py 空文件，告知python这个目录是一个Python包
    ├── settings.py 设置文件
    ├── urls.py     url声明，也就是django网站的内容列表
    └── wsgi.py     WSGI兼容的web服务
```

# 创建项目

验证Django项目工作，进入`mysite`目录，然后执行

```
python manage.py runserver
```

此时看到输出

```
Performing system checks...

System check identified no issues (0 silenced).

You have 13 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): admin, auth, contenttypes, sessions.
Run 'python manage.py migrate' to apply them.

June 23, 2017 - 02:42:58
Django version 1.11.2, using settings 'mysite.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

`注意`：默认开发环境django运行监听在`127.0.0.1:8000`，所以外部不能直接访问。

可以通过django参数来指定端口以及监听的IP地址

例如，监听端口改成8080

```
python manage.py runserver 8080
```

监听所有网络接口的8000端口

```
python manage.py runserver 0:8000
```

> 注意：在CentOS 7上默认开启了firewall防火墙，要能够让外部访问，需要执行如下命令

```shell
sudo firewall-cmd --zone=public --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

* 此时在浏览器上访问 http://SERVER_IP:8000 可以看到Django页面，但是，如果是从外部访问，django有一个安全限制，会在页面提示所访问的http头部中包含的主机IP地址不在允许范围（默认只允许127.0.0.1回环地址访问）：

```
DisallowedHost at /
Invalid HTTP_HOST header: '192.168.1.156:8000'. You may need to add '192.168.1.156' to ALLOWED_HOSTS.
Request Method:	GET
Request URL:	http://192.168.1.156:8000/
Django Version:	1.11.2
Exception Type:	DisallowedHost
Exception Value:	
Invalid HTTP_HOST header: '192.168.1.156:8000'. You may need to add '192.168.1.156' to ALLOWED_HOSTS.
```

参考 [Invalid http_host header](https://stackoverflow.com/questions/40582423/invalid-http-host-header) ，修改 `setting.py` 配置文件，设置

```python
ALLOWED_HOSTS = ['192.168.1.156', 'localhost', '127.0.0.1']
```

# 创建polls应用

以上是创建了`mysite`项目，接下来需要在项目中创建应用：每个应用就是按照一系列约定编写的python包。Django有一个工具可以自动生成app的基本目录结构，这样就可以聚焦在编写代码而不是创建目录。

> projects vs. apps
>
> app是一个web应用可以完成一定工作，例如weblog，数据库记录，投票系统等。project则是一组配置和apps用于构建website。一个project可以包含多个apps，而一个app可以属于多个projects。

* 创建app

```
python manage.py startapp polls
```

此时在项目目录下创建按了`polls`子目录

```
polls/
├── admin.py
├── apps.py
├── __init__.py
├── migrations/
│   └── __init__.py
├── models.py
├── tests.py
└── views.py
```

* 修改第一个视图`polls/views.py`

```
from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")
```

> 注意：必须`from django.http import HttpResponse`之后才能使用`return HttpResponse("...")`

* 创建`polls/urls.py`

```python
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
]
```

* 然后在根上指出root URL在`polls.urls`模块，所以在`mysite/urls.py`添加

> 注意：这里`mysite/urls.py`是在项目目录下默认就建立的一个子目录，也就是默认就有一个app代表网站自身。其中已经有了一个`urls.py`文件，默认就包含了`url(r'^admin/', admin.site.urls),`

```python
from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    url(r'^polls/', include('polls.urls')),
    url(r'^admin/', admin.site.urls),
]
```

> 必须先`from django.conf.urls import include`才能使用`include('polls.urls')`，这样就可以把部分url引用放到各自目录下。

`url()`功能可以传递4个参数，有两个参数`regex`和`view`是必须的，另外两个`kwargs`和`name`是可选的。

* `url()参数:regex`

`regex`是"规则表达式"（regular expression）的缩写。注意，这些规则表达式不会搜索`GET`和`POST`参数，或者域名。例如，请求 https://www.example.com/myapp/ ，则`URLconf`将看到`myapp/`，并且请求 https://www.example.com/myapp/?page=3 ，此时URL依然只看到 `myapp/`。

> 规则表达式应该在首次URLconf模块加载时编译以确保性能。

* `url()参数：view`

当Django找寻匹配的正则表达式，就会请求特定视图功能，使用一个`HttpRequest`对象作为第一个参数，并且任何在正则表达式"捕捉到"的值就作为参数。如果regex使用简单捕捉，值就作为位置参数。如果使用命名的捕捉，值就作为一个关键值参数传递。

* `url()参数：kwargs`

抽象关键词参数将作为一个字典传递给目标视图。

* `url()参数：name`

命名你所使用的URL就可以作为一个明确的引用在Django任何位置使用，特别是在模板中。这个强大的功能使得你可以创建全局变更到URL参数给项目，只需要访问一个单一文件。

# 数据库设置

* 编辑`mysite/settings.py`，这是一个使用模块层变量表达Django设置的Python模块。默认使用SQLite，如果是生产环境，则可以使用更具扩展性的数据库，如PostgreSQL。

如果使用其他数据库，需要安装相应的[database bindings](https://docs.djangoproject.com/en/1.11/topics/install/#database-installation)并修改配置文件

修改`mysite/settings.py`，其中DATABASES配置中的`ENGINE`设置成相应的数据库类型，如'django.db.backends.postgresql', 'django.db.backends.mysql'

```python
# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```

如果不使用SQLite，需要配置增加`USER`,`PASSWORD`和`HOST`参数。

# `settings.py`中其他设置

* 时区 - `TIME_ZONE`
* 激活的Django apps - `INSTALLED_APPS`

这些应用默认包含了一个共用案例的便利转换。一些应用使用至少一个数据库表，所以需要在使用它们之前先创建数据库表。这个工作通过以下命令完成：

```bash
python manage.py migrate
```

这个`migrate`命令会检查`INSTALLED_APPS`设置并根据`misite/settings.py`创建任何需要的数据库表以及和应用程序一起发布的数据库迁移。可以通过数据库管理来查看上述命令创建的表格。

# 创建模式

现在需要定义模式 - 也就是使用附加的元数据来定义数据库结构。

这个简单的投票程序，创建2个models：`Question`和`Choice`: `Question`是一个问题并且有一个发布时间；`Choice`则有两个字段：选择文本和一个投票记录。每个`Choice`和一个`Question`关联。

这些概念是通过简单的Python classes。编辑`pools/models.py`

```python
from django.db import models

# Create your models here.
class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
```

每个model都是通过[django.db.models.Model](https://docs.djangoproject.com/en/1.11/ref/models/instances/#django.db.models.Model)的子类来表述class。每个模块有一系列类变量，也就是在模式中表示数据库字段。

每个字段都通过一个[Field](https://docs.djangoproject.com/en/1.11/ref/models/fields/#django.db.models.Field)类的实例来表述 - 例如，[CharField](https://docs.djangoproject.com/en/1.11/ref/models/fields/#django.db.models.CharField)是字符字段，而[DateTimeField](https://docs.djangoproject.com/en/1.11/ref/models/fields/#django.db.models.DateTimeField)是日期字段。这样就可以告知Django每个数据字段的类型。

每个[字段](https://docs.djangoproject.com/en/1.11/ref/models/fields/#django.db.models.Field)实例的名字（例如`question_text`或`pub_date`）是字段的名字，使用机器友好的格式。在Python代码中可以使用这些值，并且数据库将它们作为列名字。

一些字段有附加参数，例如[CharField](https://docs.djangoproject.com/en/1.11/ref/models/fields/#django.db.models.CharField)需要设置[max_length](https://docs.djangoproject.com/en/1.11/ref/models/fields/#django.db.models.CharField.max_length)。这个参数限制只作用于数据库schema。

注意，上述定义使用了[ForeignKey](https://docs.djangoproject.com/en/1.11/ref/models/fields/#django.db.models.ForeignKey)告知Django每个Choice是和一个Question关联的。Django支持所有常用数据库关系：many-to-one, many-to-many, one-to-one。

# 激活模式

模式的少量代码可以赋予Django大量的西溪，这样Django可以：

* 为应用程序创建一个数据库schema（`CREATE TABLE`声明）
* 创建一个Python数据库访问API来访问`Question`和`Choice`对象

目前需要首先告诉项目，`polls`应用已安装好。

> Django apps 是`热插拔`(pluggable)，可以将一个app用于多个项目，然后可以分发apps，因为app在Django安装是并没有附加。

要将应用添加到项目，需要在`INSTALLED_APPS`设置中加上一个引用配置类。这里的`polls/apps.py`文件中有一个`PollsConfig`类，所以其点路径是`polls.apps.PollsConfig`。编辑`mysite/settings.py`文件添加点路径到`INSTALLED_APPS`设置中。

* `mysite/settings.py`

```python
# Application definition

INSTALLED_APPS = [
    'polls.apps.PollsConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
```

此时Django就知道包含`polls`这个app，执行以下命令

```
python manage.py makemigrations polls
```

就会看到如下输出信息：

```
Migrations for 'polls':
  polls/migrations/0001_initial.py
    - Create model Choice
    - Create model Question
    - Add field question to choice
```

这里使用`makemigrations`是告知Django作出了模式修改，并希望作为一个migration来将更改存储。

migration是Django存储修改到模式中（然后是数据库schema）- 也就是磁盘中的文件。要查看刚才创建`polls`的新模型可以查看`polls/migrations/0001_initial.py`。

运行migration来管理数据库schema的操作，通过[sqlmigrate](https://docs.djangoproject.com/en/1.11/ref/django-admin/#django-admin-sqlmigrate)来获取migration名字和返回SQL:

```
python manage.py sqlmigrate polls 0001
```

此时可以看到以下输出

```sql
BEGIN;
--
-- Create model Choice
--
CREATE TABLE "polls_choice" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "choice_text" varchar(200) NOT NULL, "votes" integer NOT NULL);
--
-- Create model Question
--
CREATE TABLE "polls_question" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "question_text" varchar(200) NOT NULL, "pub_date" datetime NOT NULL);
--
-- Add field question to choice
--
ALTER TABLE "polls_choice" RENAME TO "polls_choice__old";
CREATE TABLE "polls_choice" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "choice_text" varchar(200) NOT NULL, "votes" integer NOT NULL, "question_id" integer NOT NULL REFERENCES "polls_question" ("id"));
INSERT INTO "polls_choice" ("votes", "id", "choice_text", "question_id") SELECT "votes", "id", "choice_text", NULL FROM "polls_choice__old";
DROP TABLE "polls_choice__old";
CREATE INDEX "polls_choice_question_id_c5b4b260" ON "polls_choice" ("question_id");
COMMIT;
```

这里`sqlmigrate`命令并没有实际migrate数据库，而只是打印输出到屏幕，这样可以查看SQL Django会执行的操作，对于检查Django将要做的操作非常有用，特别是作为数据库管理员还可以修改SQL脚本。

如果感兴趣，还可以运行 `python manage.py check` 来检查项目的问题，而不会实际做修改。

现在可以运行`migrate`来创建数据库的模式表格：

```
python manage.py migrate
```

简单来说，实现模式修改需要3个步骤：

* 修改模式（在`models.py`中修改）
* 运行`python manage.py makemigrations`来创建这些修改的migrations
* 运行`python manage.py migrate`将这些修改作用到数据库

有关详细的`manage.py`工具使用信息参考[django-admin documentation](https://docs.djangoproject.com/en/1.11/ref/django-admin/)

# 使用API

可以通过交互的Python shell来使用Django API:

```
python manage.py shell
```

这里使用`manage.py`而不是直接`python`是因为可以设置`DJANGO_SETTINGS_MODULE`环境变量，这是通过`mysite/settings.py`文件中导入的路径

> 如果不是使用`manage.py`则需要使用以下命令来设置：

```python
import django
djiango.setup()
```

一旦进入shell，可以使用[database API](https://docs.djangoproject.com/en/1.11/topics/db/queries/)

```python
>>> from polls.models import Question, Choice  # 这里导入模式中的类
>>> Question.objects.all()  # 由于尚未添加数据库记录，所以Question中是空的
<QuerySet []>
```

```python
# 创建一个新问题
# 在默认设置文件已经激活time zone，所以Django希望使用tzinfo的datetime来填写pub_date
# 使用 timezone.now() 来代替 datetime.datetime.now() 就能正确完成
>>> from django.utils import timezone
>>> q = Question(question_text="What's new?", pub_date=timezone.now())

# 保存对象到数据库，使用 save()
>>> q.save()

# 现在已经保存了一个Question数据记录，也就是有一个id，可以使用以下命令显示
# 注意：根据数据库不同，有可能显示"1L"而不是"1"
>>> q.id
1

# 通过Python属性来访问模式的
>>> q.question_text
"What's new?"
>>> q.pub_date
datetime.datetime(2017, 8, 6, 7, 43, 20, 396652, tzinfo=<UTC>)

# 通过修改属性可以修改字段内容，然后再保存
>>> q.question_text = "What's up?"
>>> q.save()

# objects.all()显示所有数据中的question
# 但是这里显示完全无用的对象<Question: Question object>是因为python 2的兼容问题
# 需要修改Question模型（polls/models.py）
>>> Question.objects.all()
<QuerySet [<Question: Question object>]>
```

这里会发现`<Question: Question object>`是完全无用对象，通过修改Question模型（`polls/models.py`）来添加`__str__()`方法：

```python
from django.db import models
from django.utils.encoding import python_2_unicode_compatible

@python_2_unicode_compatible  # only if you need to support Python 2
class Question(models.Model):
    # ...
    def __str__(self):
        return self.question_text

@python_2_unicode_compatible  # only if you need to support Python 2
class Choice(models.Model):
    # ...
    def __str__(self):
        return self.choice_text
```

这里重要的是添加`__str__()`方法到模型中，不仅是处理交互，也是因为对象的代表在整个Django自动化生成的管理中使用。

注意，这个是常规的Python方法，现在加上自定义方法`polls/models.py`：

```python
import datetime

from django.db import models
from django.utils import timezone


class Question(models.Model):
    # ...
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)
```

这里`import datetime`和`from django.utils import timezone`是引用Python标准datetime模块和Django的time-zone相关工具`django.utils.timezone`。

保存好上述修改，然后重新启动一个`python manage.py shell`:

```python
>>> from polls.models import Question, Choice

# 确认__str__()添加生效，使用以下查询可以看到返回了对象集
>>> Question.objects.all()
<QuerySet [<Question: What's up?>]>

# Django提供了一个数据库查看API
>>> Question.objects.filter(id=1)
<QuerySet [<Question: What's up?>]>

# 查询发布在今年的问题
>>> from django.utils import timezone
>>> current_year = timezone.now().year
>>> Question.objects.get(pub_date__year=current_year)
<Question: What's up?>

# 查询不存在的id
>>> Question.objects.get(id=2)
Traceback (most recent call last):
  File "<console>", line 1, in <module>
  File "/home/huatai/venv/lib/python3.4/site-packages/django/db/models/manager.py", line 85, in manager_method
    return getattr(self.get_queryset(), name)(*args, **kwargs)
  File "/home/huatai/venv/lib/python3.4/site-packages/django/db/models/query.py", line 380, in get
    self.model._meta.object_name
polls.models.DoesNotExist: Question matching query does not exist.

# 大多数情况下会查询一个主键，所以Django提供了一个快捷的主键查询
# 以下是查询Question.objects.get(id=1)
>>> Question.objects.get(pk=1)
<Question: What's up?>

# 确认定制方法可工作
>>> q = Question.objects.get(pk=1)
>>> q.was_published_recently()
True

# 为问题提供一系列答案，以下船舰一个选择对象，插入状态和添加选择到可选集合
# 一个处理"other side"的外键可以通过API访问
>>> q = Question.objects.get(pk=1)

# 显示相关对象集的所有选择，当前是空的
>>> q.choice_set.all()
<QuerySet []>

# 创建3个选择
>>> q.choice_set.create(choice_text='No much', votes=0)
<Choice: No much>
>>> q.choice_set.create(choice_text='The sky', votes=0)
<Choice: The sky>
>>> c = q.choice_set.create(choice_text='Just hacking again', votes=0)

# 通过API访问问题相关对象
>>> c.question
<Question: What's up?>

# 反过来：问题对象来访问选择对象
>>> q.choice_set.all()
<QuerySet [<Choice: No much>, <Choice: The sky>, <Choice: Just hacking again>]>
>>> q.choice_set.count()
3

# API自动建立需要的关系
# 查询所有今年pub_date的所有问题的所有选择
>>> Choice.objects.filter(question__pub_date__year=current_year)
<QuerySet [<Choice: No much>, <Choice: The sky>, <Choice: Just hacking again>]>

# 现在尝试删除一个选择，使用 delete()
>>> c = q.choice_set.filter(choice_text__startswith='Just hacking')
>>> c.delete()
(1, {'polls.Choice': 1})
```

# Django Admin

* 创建admin用户

```
python manage.py createsuperuser
```

完成后，即可通过 http://127.0.0.1:8000/admin/ 访问管理登录界面

* 现在需要告诉admin有关Question对象才能具有admin界面，所以编辑  `polls/admin.py` 文件：

```python
from django.contrib import admin

# Register your models here.
from .models import Question

admin.site.register(Question)
```

此时注册了Question，Django就知道如何显示在管理索引页面。

[管理界面注册Question](../../../../img/develop/python/django/startup/admin_register_question.png)

点击"Question"，就位于Question的"修改列表"，该页面也就是数据库的显示所有question的页面，可以允许修改。

> 如果"Date published"显示的时间不是你实际创建时间，则表明前面设置`TIME_ZONE`设置错误。

# 参考

* [Writing your first Django app, part 1](https://docs.djangoproject.com/en/1.11/intro/tutorial01/)