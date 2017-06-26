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

```
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

```
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

```
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
]
```

* 然后在根上指出root URL在`polls.urls`模块，所以在`mysite/urls.py`添加

> 注意：这里`mysite/urls.py`是在项目目录下默认就建立的一个子目录，也就是默认就有一个app代表网站自身。其中已经有了一个`urls.py`文件，默认就包含了`url(r'^admin/', admin.site.urls),`

```
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

```
# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```

# `settings.py`中其他设置

* 时区 - `TIME_ZONE`
* 激活的Django apps - `INSTALLED_APPS`

这些应用默认包含了一个共用案例的便利转换。一些应用使用至少一个数据库表，所以需要在使用它们之前先创建数据库表。这个工作通过以下命令完成：

```
python manage.py migrate
```

这个`migrate`命令会检查`INSTALLED_APPS`设置并根据`misite/settings.py`创建任何需要的数据库表以及和应用程序一起发布的数据库迁移。可以通过数据库管理来查看上述命令创建的表格。

# 创建模式

现在需要定义模式 - 也就是使用附加的元数据来定义数据库结构。

这个简单的投票程序，创建2个models：`Question`和`Choice`: `Question`是一个问题并且有一个发布时间；`Choice`则有两个字段：选择文本和一个投票记录。每个`Choice`和一个`Question`关联。

这些概念是通过简单的Python classes。编辑`pools/models.py`

```

```

# 参考

* [Writing your first Django app, part 1](https://docs.djangoproject.com/en/1.11/intro/tutorial01/)