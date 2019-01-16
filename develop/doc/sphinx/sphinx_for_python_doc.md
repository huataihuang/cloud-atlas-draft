# Sphinx简介

[Sphinx Doc](http://www.sphinx-doc.org) 最初是作为Python代码文档自动生成工具，现在也开始支持C/C++，以及计划支持更多语言程序文档的创建。由于文档撰写格式优雅，逐渐作为技术文档的撰写平台使用。

Sphinx使用Python编写，并且支持Python 3.5+。

# 安装

## Debian/Ubuntu

For Python 2:

```
apt-get install python-sphinx
```

For Python 3:

```
apt-get install python3-sphinx
```

## Fedora安装sphinx-doc

> 参考[Fedora developer: Sphinx](https://developer.fedoraproject.org/tech/languages/python/sphinx.html)

For Python 2:

```
sudo dnf install python2-sphinx
```

For Python 3:

```
sudo dnf install python3-sphinx
```

## 通过virtualenv安装

注意：在CentOS或者macOS环境，如果同时安装了python 2和python 3，则会有`pip2`和`pip3`，都可以安装各自的`virtualenv`。不过，系统只有一个`/usr/local/bin/virtualenv`，这个工具有一个参数`-p PYTHON_EXE, --python=PYTHON_EXE`可以用来指定Python解析器，例如 `--python=python3.5`。默认是使用`/bin/python3.6`。

```
virtualenv venv3
. venv3/bin/activate
```

> 参考[Document your Django projects: reStructuredText and Sphinx](http://www.marinamele.com/2014/03/document-your-django-projects.html)

```
pip install sphinx
```

## MacOS 安装sphinx-doc

> 以下实践在Mac OS X上完成，基本方法和Linux类似

Mac OS X 已经自带了python，不过没有安装`pip`，需要先通过`easy_install`安装`pip`，进而安装`sphinx-doc`

```
sudo easy_install pip
sudo pip install sphinx
```

注意：如果直接通过[Python官方网站](https://www.python.org)下载安装 `macOS 64-bit installer`，则会直接提供 `pip` （当前已经不再推荐使用easy_install来安装pip了，因为高版本Python已经自带pip来取代easy_install）

以下是macOS + Python 3.7 执行：(参考官方安装方法)

```
virtualenv venv3
. venv3/bin/active
pip install -U sphinx
```

> 安装`sphinx`需要root权限，否则无法写入`/Library/Python/2.7/site-packages`目录

在mac上安装遇到报错

```
OSError: [Errno 1] Operation not permitted: '/tmp/pip-sGSJDx-uninshpinx
 stall/System/Library/Frameworks/Python.framework/Versions/2.7/Extras/lib/python/six-1.4.1-py2.7.egg-info'
```

这个报错在 [Six issue when installing package #3165](https://github.com/pypa/pip/issues/3165) 有解释和解决方法：

跳过uninstall系统级别的site-packages：

```
pip install --ignore-installed six
```

报错原因是Mac OS X EI Capitan或更高版本已经安装了six 1.4.1，当通过`pip`安装新版本时会尝试卸载旧版本。但是从 EI Capitan 版本开始，Mac OS X引入了一个称为[System Integrity Protection](https://en.wikipedia.org/wiki/System_Integrity_Protection)系统完整性保护的功能。也称为`rootless`，这是通过内核提供的一种机制，保护系统所属的文件目录不被没有特别授权的进程修改，甚至连root用户或root权限用户（sudo）都不能修改。Apple这样设计操作系统是是为了避免明显的系统机制的安全，特别是单个用户具备了administrator权限的环境。默认启用了系统完整性保护，提供了以下机制：

* 保护系统文件目录的内容和文件权限
* 保护进程不被代码注入，运行时附加（类似debugging）和DTrace
* 拒绝没有签名的内核扩展

通过添加一个扩展的文件属性，或者通过将文件或目录加入到`/System/Library/Security/rootless.conf`来设置保护属性。保护的目录包括 `/System`, `/bin`, `/sbin`, `/usr`。以及从`/etc`, `/tmp`, `var` 符号链接到`/private/etc`, `/private/tmp` 和 `/private/var` 来实现保护。

系统完整性保护只有在系统分区之外才能整个或部分禁止。Apple在recovery system或从安装盘启动时候提供的终端窗口中，可以执行`csrutil`命令行工具。安装macOS时候，installer将任何位于标记为系统目录中的组件移动到`/Library/SystemMigration/History/Migration-[some UUID]/QuarantineRoot/`。通过保护系统目录，系统文件和目录只能在Apple软件更新的时候自动维护。所以，这种权限修复没有在Disk Utility和相应的diskutil操作中提供。

> 参考 [System Integrity Protection](https://en.wikipedia.org/wiki/System_Integrity_Protection)

# Linux Kernel Document

Linux Kernel Documents使用了sphinx来构建，请参考指导文档 [How to write kernel documentation](https://www.kernel.org/doc/html/latest/doc-guide/index.html)

可以通过git方式下载源代码，并且从不同的tag获取对应版本的内核源代码（包括文档）

```
cd /usr/src/kernels
git clone https://github.com/torvalds/linux.git

git checkout v4.20  # 注意：此时是Tag v4.20
git branch -b v4.20 # 转换成本地分支
```

```
virtualenv venv3
. venv3/bin/activate
pip install -r /usr/src/kernels/linux/Documentation/sphinx/requirements.txt
```

生成文档

```
cd /usr/src/kernels/linux
make htmldocs
```

注意：一定要在内核源代码根目录下执行上述`make htmldocs`命令。不要在`Documentation`子目录下执行，否则会报错（参考 [Generating html linux documentation with sphinx](https://unix.stackexchange.com/questions/436953/generating-html-linux-documentation-with-sphinx) ）：

```
make: *** empty variable name.  Stop.
make: *** [cleandocs] Error 2
```

输出的文档内容位于`Documentation/output`目录下，可以通过浏览器浏览。

## 单独选译内核文档

由于我对内核部分文档比较感兴趣，所以准备做一些选译，则采用如下方法复制出部分文档目录：

```bash
src_doc_dir=/usr/src/kernels/linux/Documentation
dst_doc_dir=/home/huatai/github/kernel-doc

cp $src_doc_dir/index.rst $dst_doc_dir/
cp $src_doc_dir/conf.py $dst_doc_dir/
cp -R $src_doc_dir/sphinx $dst_doc_dir/
cp -R $src_doc_dir/admin-guide $dst_doc_dir/
cp -R $src_doc_dir/kernel-hacking $dst_doc_dir/
cp -R $src_doc_dir/doc-guide $dst_doc_dir/
cp -R $src_doc_dir/vm $dst_doc_dir/
cp -R $src_doc_dir/trace $dst_doc_dir/
```

这样就可以使用如下命令来构建文档：

```
sphinx-build -b html . output
```

输出的文档位于 `output` 子目录，可以很方便做文档翻译。

注意：Linux Kernel Documentation使用了sphinx 1.4.9，其中有语法和最新版本不兼容。所以在部署到 [Read the Docs](https://readthedocs.org) 网站时候，需要使用 `Advanced Settings`，指定 Requirements files: `sphinx/requirements.txt` ，以及指定 Python configuration file: `conf.py`，否则会导致编译错误。

# 创建文档

* 在 `项目` 目录下创建一个文档目录，例如在源代码目录下创建一个 `docs` 目录

```
mkdir docs
cd docs
```

* 在文档目录 `docs` 下执行

```
sphinx-quickstart
```

> 在提示 `separate the source and build directories` 回答 `y`
>
> 在提示 `autodoc extension` 回答 `y`

完成上述初始化后目录结构类似

```
myproject/
|-- README
|-- setup.py
|-- myvirtualenv/
|-- mypackage/
|   |-- __init__.py
|   `-- mymodule.py
`-- docs/
    |-- MakeFile
    |-- build/
    `-- source/
```

# 安装 theme

可以选择 [sphinx_rtd_theme](https://github.com/snide/sphinx_rtd_theme) 作为基础文档风格

```
pip install sphinx_rtd_theme
```

只需要修改 `config.py` 配置

```
import sphinx_rtd_theme
html_theme = "sphinx_rtd_theme"
html_theme_path = [sphinx_rtd_theme.get_html_theme_path()]
```

# 自动化生成文档

通过 `autodoc` 可以告知 Sphinx 查看 docstrings 并生成项目的文档。

首先打开 `docs/source/conf.py` 文件修改配置

```
import os
import sys
sys.path.insert(0, os.path.abspath('../..'))
```

> 这里设置路径是 `../..` 表示从 `source/` 目录开始往上2级才是代码程序项目目录
   
一个  `mymodule.py` 案例

```
#!/usr/bin/env python
#-*- coding:utf8 -*-

"""mymodule功能

mymodule的功能就是一个样本

"""

import os

defineGlobalVairiable = True

#define class
class TestClass(object):
    """Class description """

#define function
def testFunction(self,parameters):
    """Function description"""

#main program 程序入口
if __name__ == '__main__':
    print 'Hello world'
```

然后执行

```
sphinx-apidoc -f -o source/ ../mypackage/
```

测试会自动生成

```
Creating file source/mymodule.rst.
Creating file source/modules.rst.
```

然后就可以根据自动生成的程序模块来构建html文档


```
sphinx-build -b html source build
```

使用浏览器打开 `docs/build/html/index.html` 阅读文档，也可以同步到web网站提供访问。

# 使用sphinx撰写独立书籍

比上述使用`autodoc`要简单一些，只要执行一次

```
sphinx-build -b html source build
```

# 参考

* [Sphinx for Python documentation](http://gisellezeno.com/tutorials/sphinx-for-python-documentation.html)
* [Document your Django projects: reStructuredText and Sphinx](http://www.marinamele.com/2014/03/document-your-django-projects.html)