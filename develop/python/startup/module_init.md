在Python源代码目录下有一个`__init__.py`文件，这个文件是初始化模块`from-import`语句需要使用它来倒入子包。`__init__.py`文件使得Python将目录视为包含包的目录，如果没有用到，这个文件也可以是空文件。如果忘记在包目录下加入`__init__.py`文件，会导致`ImportWarning`信息。

[6.4. Packages](https://docs.python.org/3/tutorial/modules.html#packages)详细描述了结构化Python模块的命名空间结构。


# 参考

* [What is __init__.py for?](http://stackoverflow.com/questions/448271/what-is-init-py-for)