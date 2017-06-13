Django建议以"应用"形式组织代码，这样，一个项目中可以放多个应用，而且可以使用其他人开发的第三方应用，也可以重用自己在其他项目中开发的应用。

在代办事项清单中创建一个用用；

```
python3 manage.py startapp lists
```

该命令会在`superlists`文件夹中创建子文件夹`lists`，并与`superlists`子文件夹并列。

单元测试和功能测试的区别：
* 功能测试站在用户的角度从外部测试应用，单元测试则站在程序员的角度从内部测试应用。
* 功能测试的作用是帮助你开发具有所需功能的应用，还能保证你不会无意中破坏这些功能。单元测试的作用是帮助你编写简洁无错的代码。

# Django中的单元测试

在新生成的文件 `lists/tests.py` 中

```
from django.test import TestCase

# Create your tests here.
```

Django提供了TestCase的一个特殊版本，是标准版`unittest.TestCase`的增强版，添加了一些Django专用的功能。

这里我们先创建一个测试的故意错误的单元测试`lists/tests.py`

```
from django.test import TestCase

class SmokeTest(TestCase):
    def test_bad_maths(self):
        self.assertEqual(1 + 1, 3)
```

然后执行

```
python3 manage.py test
```

则提示输出

```
Creating test database for alias 'default'...
F
======================================================================
FAIL: test_bad_maths (lists.tests.SmokeTest)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/Users/huatai/Dropbox/works/tdd-python/superlists/lists/tests.py", line 5, in test_bad_maths
    self.assertEqual(1 + 1, 3)
AssertionError: 2 != 3

----------------------------------------------------------------------
Ran 1 test in 0.001s

FAILED (failures=1)
Destroying test database for alias 'default'...
```

可以看到单元测试检验出了错误的计算逻辑

# Django的MVC、URL和视图函数

Django采用了经典的"模型-视图-控制器"（Model-View-Controller，MVC）模式，但是没有严格遵守。Django有模型，但是视图更像是控制器，模板其实才是视图。

现在先准备一个测试，也就是先修正前面的`lists/tests.py`

```
from django.core.urlresolvers import resolve
from django.test import TestCase
from lists.views import home_page

class HomePageTest(TestCase):
    def test_root_url_resolves_to_home_page_view(self):
        found = resolve('/')
        self.assertEqual(found.func, home_page)
```

`resolve`是Django内部使用的函数，用于解析URL，并将其映射到响应的视图函数上。检查解析网站根路径"/"，是否能找到名为`home_page`的函数。

此时执行`python3 manage.py test`会看到报错显示无法`import ‘home_page'函数`

```
ImportError: cannot import name 'home_page'
```

> 在使用TDD时要注意，每次少量修改代码，让失败的测试通过即可。

由于上述测试显示缺少`home_page`函数，所以我们现在在`lists.views.py`中添加如下代码

```
from django.shortcuts import render

# Create your views here.
# 实际上我们只添加了下面这行
home_page = None
```

虽然上述代码实际上没有用处，但是可以使得`python3 manage.py test`测试的错误输出个iabian，至少显示能够找到函数`home_page`了

```
...
  File "/Users/huatai/Dropbox/works/tdd-python/superlists/lists/tests.py", line 7, in test_root_url_resolves_to_home_page_view
    found = resolve('/')
...
django.urls.exceptions.Resolver404: {'tried': [[<RegexURLResolver <RegexURLPattern list> (admin:admin) ^admin/>]], 'path': ''}
....
```

上述`404`错误表示在尝试解析`/`时，Django抛出了404错误，也就是无法找到`/`的URL映射。

# `urls.py`

Django在`urls.py`文件中定义如何把URL映射到视图函数上。在文件夹`superlists/superlists`中有一个主`urls.py`文件，这个文件应用于整个网站。