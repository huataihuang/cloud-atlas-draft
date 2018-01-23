# 实践案例

在一个Django开发项目`virtman`中，采用[Sphinx-doc](http://www.sphinx-doc.org)来构建项目说明文档。

Django项目目录结构示例：

```
.
|-- README.md
|-- api
|   |-- admin.py
|   |-- models.py
|   |-- serializers.py
|   |-- signals.py
|   |-- views.py
|-- notify
|   |-- admin.py
|   |-- apps.py
|   |-- models.py
|   |-- views.py
`-- virtman
    |-- urls.py
    |-- views.py
```

# 安装

使用virtualenv安装

```
pip install sphinx
```

# 创建docs目录

先进入项目目录，然后执行如下启动命令

```
sphinx-quickstart
```

> 注意 `autodoc` 的地方一定要选是，其他选默认没什么问题。

```
Enter the root path for documentation.
> Root path for the documentation [.]: ./docs                                               <= 这里创建docs目录

You have two options for placing the build directory for Sphinx output.
Either, you use a directory "_build" within the root path, or you separate
"source" and "build" directories within the root path.
> Separate source and build directories (y/n) [n]: n

Inside the root directory, two more directories will be created; "_templates"
for custom HTML templates and "_static" for custom stylesheets and other static
files. You can enter another prefix (such as ".") to replace the underscore.
> Name prefix for templates and static dir [_]: _

The project name will occur in several places in the built documentation.
> Project name: virtman
> Author name(s): Huatai Huang

Sphinx has the notion of a "version" and a "release" for the
software. Each version can have multiple releases. For example, for
Python the version is something like 2.5 or 3.0, while the release is
something like 2.5.1 or 3.0a1.  If you don't need this dual structure,
just set both to the same value.
> Project version []: 1.0
> Project release [1.0]: 1.0

If the documents are to be written in a language other than English,
you can select a language here by its language code. Sphinx will then
translate text that it generates into that language.

For a list of supported codes, see
http://sphinx-doc.org/config.html#confval-language.
> Project language [en]: 

The file name suffix for source files. Commonly, this is either ".txt"
or ".rst".  Only files with this suffix are considered documents.
> Source file suffix [.rst]: .rst

One document is special in that it is considered the top node of the
"contents tree", that is, it is the root of the hierarchical structure
of the documents. Normally, this is "index", but if your "index"
document is a custom template, you can also set this to another filename.
> Name of your master document (without suffix) [index]: index

Sphinx can also add configuration for epub output:
> Do you want to use the epub builder (y/n) [n]: n

Please indicate if you want to use one of the following Sphinx extensions:
> autodoc: automatically insert docstrings from modules (y/n) [n]: y                        <= 必选y，从模块创建
> doctest: automatically test code snippets in doctest blocks (y/n) [n]: n
> intersphinx: link between Sphinx documentation of different projects (y/n) [n]: n
> todo: write "todo" entries that can be shown or hidden on build (y/n) [n]: n
> coverage: checks for documentation coverage (y/n) [n]: y
> imgmath: include math, rendered as PNG or SVG images (y/n) [n]: n
> mathjax: include math, rendered in the browser by MathJax (y/n) [n]: n
> ifconfig: conditional inclusion of content based on config values (y/n) [n]: n
> viewcode: include links to the source code of documented Python objects (y/n) [n]: n
> githubpages: create .nojekyll file to publish the document on GitHub pages (y/n) [n]: y

A Makefile and a Windows command file can be generated for you so that you
only have to run e.g. `make html' instead of invoking sphinx-build
directly.
> Create Makefile? (y/n) [y]: y
> Create Windows command file? (y/n) [y]: n
```

以上操作将在项目目录下创建`docs`目录，包含`conf.py`，`index.rst`和`Makefile`，以及目录`_build`，`_static`和`_templates`。

# 创建html文件

进入`docs`目录。

默认的theme比较简陋，选择 [sphinx_rtd_theme](https://github.com/snide/sphinx_rtd_theme) 作为基础文档风格

```
pip install sphinx_rtd_theme
```

只需要修改 `config.py` 配置

```
import sphinx_rtd_theme
html_theme = "sphinx_rtd_theme"
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
```

运行以下命令输出文档

```
make html
```

此时还只是一个空的文档。

# 针对Django配置

假设Django项目目录如下

* 编辑`conf.py`文件，在以下行后面

```
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))
```

下面添加

```
import os
import sys
import djiango
sys.path.insert(0, os.path.abspath('..'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'virtman.settings'
django.setup()
```

> 这里`virtman.settings`是项目`virtman`，其目录下有`settings.py`配置文件。

这就告诉sphinx去哪里查找项目文件

# 撰写基本的手工文档

只需要在项目文档中创建目录结构以及`*.rst`文档源文件。

关键点是在文档中打见目录引用关系，最终目录树会将所有文档的章节拼接成一个整体的目录树：

* 在`docs/index.rst`中加入这个目录树的定义：

```
.. toctree::
   :maxdepth: 3

   usecases/index
   
   api/models
   api/admin
   api/views

   notify/models
   notify/views
```

上述`index.rst`中，每个`.rst`文件对应都建立一个索引。注意`/`之前是目录，之后是`xxs.rst`文件（如`models.rst`），即如`api/models.rst`。这样的文件结构是完全和Django项目文件一一对应（需要对哪个`.py`程序抽取注释就创建对应的目录树定义）。

* 建立索引文件之后，再按照目录创建和django的project以及app相同的目录结构和对应程序的文档，这样就可以指引Sphinx去抽取对应程序中的类和模块的注释说明。

则目录对应到路径中的文件：

```
virtman/
  docs/
    index.rst
    usecases/
      index.rst
    api/
      admin.rst
      models.rst
      views.rst
    notify/
      models.rst
      views.rst
```

> 这里`usercases`是用来存放纯手写的用例文档，而 myapp 文件夹里面的内容是要打算在代码中直接抽取的。

* 绑定 Django 项目并从项目生成代码

我们需要让文档项目的上下文能正确加载 django，就好像我们调用 `python manage.py shell` 得到的上下文一样。

然后，我们在文档里面就可以通过这样的 reST 指令块来指定抽取，以 `api/models.rst` 为例：

在docs目录下执行以下命令，先生成文件

```
mkdir api
touch api/models.rst
```

编辑`api/models.rst`来对应于Django项目的`api`这个应用的`models.py`程序文件

```reStructredText
api.models module
=====================

.. automodule:: api.models
    :members:
    :undoc-members:
    :show-inheritance:
```

使用了`.. automodule`指令之后，就可以实现抽取。

* 再次执行`make html`

之后就可以在输出目录看到抽取的Python程序中的函数说明文档。



# 参考

* [使用 Sphinx 创建 Django 整体项目文档](http://www.huangwenchao.com.cn/2015/12/djangp-sphinx.html)
* [Document your Django projects: reStructuredText and Sphinx](http://www.marinamele.com/2014/03/document-your-django-projects.html)
* [How to Document Django Applications with Sphinx](http://www.wonderousponder.com/how-to-document-django-applications-with-sphinx/)