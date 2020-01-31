# TDD

* 测试驱动开发：首先编写测试
* 每次只前进一步

# 开始项目

* 创建项目目录，新建`functional_tests.py`

```
from selenium import webdriver
browser = webdriver.Firefox()
browser.get('http://localhost:8000')
assert 'Django' in browser.title
```

尝试执行

```
python3 functional_tests.py
```

显示错误

```
FileNotFoundError: [Errno 2] No such file or directory: 'geckodriver'
```

看来缺少了FireFox的驱动核心`gecko`，参考 [How to install firefoxdriver webdriver for python3 selenium on ubuntu 16.04?](http://stackoverflow.com/questions/39179320/how-to-install-firefoxdriver-webdriver-for-python3-selenium-on-ubuntu-16-04):

* 高于FireFox 47的Firefox使用新型驱动，有两种解决方法：
  * 下载和降级到Firefox 46
  * 下载最新的Marionette驱动并修改代码适应新环境

参考 [Installing Selenium and ChromeDriver on Ubuntu](https://christopher.su/2015/selenium-chromedriver-ubuntu/#selenium-version) 以及 [Marionette > WebDriver](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/WebDriver)

* 下载[最新的geckdriver](https://github.com/mozilla/geckodriver/releases)

```
cd ~/bin
tar xfz geckodriver-v0.14.0-macos.tar.gz
```

* 然后配置

```
export PATH=$PATH:/path/to/geckodriver
```

此时再次执行 `python3 functional_tests.py` 就可以看到打开了本地firefox浏览器访问测试页面 http://localhost:8000/。当然，此时我们还没有运行Django，所以看到的是空白错误页面。

# 运行Django

```
django-admin.py startproject superlists
```

上述`django-admin.py`命令会创建一个`superlists`文件夹并创建一些结构文件。现在我们开始运行Django:

```
cd superlists
python3 manage.py runserver
```

这里有一个提示

```
You have 13 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): admin, auth, contenttypes, sessions.
Run 'python manage.py migrate' to apply them.
```

尝试 `python manage.py migrate` 则提示

```
Traceback (most recent call last):
  File "manage.py", line 17, in <module>
    "Couldn't import Django. Are you sure it's installed and "
ImportError: Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH environment variable? Did you forget to activate a virtual environment?
```

这个`PYTHONPATH`环境问题参考 [Django installed, but can't import django in python](https://askubuntu.com/questions/250442/django-installed-but-cant-import-django-in-python)

执行命令检查路径

```
$ python3
>>> import sys
>>> sys.path
['', '/Library/Frameworks/Python.framework/Versions/3.6/lib/python36.zip', '/Library/Frameworks/Python.framework/Versions/3.6/lib/python3.6', '/Library/Frameworks/Python.framework/Versions/3.6/lib/python3.6/lib-dynload', '/Library/Frameworks/Python.framework/Versions/3.6/lib/python3.6/site-packages']
```

需要执行类似

```
$ PYTHONPATH=/path/to/django/parent/dir python
>>> import django  # should work now
```

实际操作可以使用

```
PTTHONPATH=/Library/Frameworks/Python.framework/Versions/3.6/lib/python3.6/site-packages/django python3
```

> 建议使用 `virtualenv` 来构建环境。 **不过上述错误实际上是我忘记python2没有安装django，需要使用`python3`**

再次运行 `python3 functional_tests.py` 就可以看到Django正常工作的提示界面：

![Django work](/ime/develop/python/django/django_work.png)

# 创建Git仓库

在阶段性完成工作后，需要将代码提交到版本控制系统。

将开发的第一个python代码移动到 `superlists` 目录下，然后开始初始化软件仓库

```
$ ls
functional_tests.py	superlists
$ mv functional_tests.py superlists/
$ cd superlists/
$ ls
db.sqlite3		manage.py
functional_tests.py	superlists
$ git init .
Initialized empty Git repository in /Users/huatai/Dropbox/works/tdd-python/superlists/.git/
```

目录中有一个`db.sqlite3`是数据库文件，这个文件不用纳入版本控制，所以将这个文件加入到`.gitignore`，告诉git将其忽略：

```
$ echo "db.sqlite3" >> .gitignore
```

接下来添加当前文件夹`.`中其他内容：

```
$ git add .
$ git status
On branch master

Initial commit

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)

	new file:   .gitignore
	new file:   functional_tests.py
	new file:   manage.py
	new file:   superlists/__init__.py
	new file:   superlists/__pycache__/__init__.cpython-36.pyc
	new file:   superlists/__pycache__/settings.cpython-36.pyc
	new file:   superlists/__pycache__/urls.cpython-36.pyc
	new file:   superlists/__pycache__/wsgi.cpython-36.pyc
	new file:   superlists/settings.py
	new file:   superlists/urls.py
	new file:   superlists/wsgi.py
```

此时发现我们错误添加了很多`.pyc`文件，这些文件没有必要提交。所以将这些文件从git中删除，并添加到`.gitignore`中：

```
$ git rm -r --cached superlists/__pycache__
rm 'superlists/__pycache__/__init__.cpython-36.pyc'
rm 'superlists/__pycache__/settings.cpython-36.pyc'
rm 'superlists/__pycache__/urls.cpython-36.pyc'
rm 'superlists/__pycache__/wsgi.cpython-36.pyc'
$ echo "__pycache__" >> .gitignore
$ echo "*.pyc" >> .gitignore
```

现在再次使用`git status`检查状态，没有问题我们就可以提交软件仓库了

```
git commit
```

# 第一个测试

```
#!/usr/bin/env python3

from selenium import webdriver
import unittest

class NewVisistorTest(unittest.TestCase):
    def setUp(self):
        self.browser = webdriver.Firefox()
 
    def tearDown(self):
        self.browser.quit()

    def test_can_start_a_list_and_retrieve_it_later(self):
        self.browser.get('http://localhost:8000')
        self.assertIn('To-Do', self.browser.title)
        self.fail('finish the test!')

if __name__ == '__main__':
    unittest.main(warnings='ignore')
```

* 设置程序运行使用系统中`python3`

```
#!/usr/bin/env python3
```

* 测试代码`test_can_start_a_list_and_retrieve_it_later`，所有以`test_`开头的方法都是测试方法，由测试主程序运行。类中可以定义多个测试方法。

* `setUp`和`tearDown`是特殊方法，分别在测试方法之前和之后运行，这里使用两个方法打开和关闭浏览器。这两个方法类似`try/except`依据，如果测试出错，也会运行`tearDown`方法，这样测试结束，Firefox窗口就会关闭。

> 如果`setUp`方法抛出异常，则`tearDown`方法不会运行

* `unittest`提供了很多用于编写测试断言的辅助函数，如`assertEqual`、`assertTrue`和`assertFalse`等，详细参考 http://docs.python.org/3/library/unittest.html

* `if __name__ == '__main__` 是用于检查python程序是否在命令行运行，而不是其他脚本中导入。调用`unittest.main()`启动`unittest`测试运行程序会自动在文件中查找测试类和方法，然后运行。

* `warnings='ignore'`会禁止抛出`ResourceWarning`异常。

执行以上测试，会看到启动Firefox，并输出测试包报告，显示了测试失败的内容

```
$ ./functional_tests.py
F
======================================================================
FAIL: test_can_start_a_list_and_retrieve_it_later (__main__.NewVisistorTest)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "./functional_tests.py", line 15, in test_can_start_a_list_and_retrieve_it_later
    self.assertIn('To-Do', self.browser.title)
AssertionError: 'To-Do' not found in 'Welcome to Django'

----------------------------------------------------------------------
Ran 1 test in 3.165s

FAILED (failures=1)
```

很好，我们现在知道访问的浏览器标题窗口没有`To-Do`关键字

* Selenium测试中还经常使用等待页面加载的指令`implicitly_wait`，以便Selenium能等待页面完全加载。

```
    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)
```

> `implicitly_wait`不适合所有情况，复杂测试需要显式等待

# 参考

* [Browser Automation Using Selenium](https://www.geeksforgeeks.org/browser-automation-using-selenium/)