在Sphinx文档中可以嵌入源代码文件，也可以选择嵌入片段，语法高亮采用 [Pygments](http://pygments.org/) 处理，支持大量语法。

# 语法高亮

* 语法高亮采用 `.. highlight:: language` :

```
.. highlight:: c
```

* 并且支持代码块:

```
.. code-block:: ruby

   Some Ruby code.
```

# 代码行号

* `code-block` 的参数 `:linenos:` 提供了行号 

```
.. code-block:: ruby
   :linenos:

   Some more Ruby code.
```

* 代码指定行高亮

```
.. code-block:: python
   :emphasize-lines: 3,5

   def some_function():
       interesting = False
       print 'This line is highlighted.'
       print 'This one is not...'
       print '...but this one is.'
```

# 包含

我感觉非常方便的是使用 `.. literalinclude:: filename` ，这个指令提供了源代码包含功能，例如：

```
.. literalinclude:: example.py
```

结合上述的代码高亮，我们可以非常方便展示代码：

* 展示完整源代码，并且提供行号以及部分指定行高亮

```
.. literalinclude:: example.rb
   :language: ruby
   :emphasize-lines: 12,15-18
   :linenos:
```

* 展示某段类的方法

```
.. literalinclude:: example.py
   :pyobject: Timer.start
```

* 展示部分代码部分行

```
.. literalinclude:: example.py
   :lines: 1,3,5-10,20-
```

* 非常方便的代码对比高亮功能，可以用来对比两个代码文件：

```
.. literalinclude:: example.py
   :diff: example.py.orig
```

# 参考

* [Showing code examples](http://www.sphinx-doc.org/en/1.5/markup/code.html)
* [literalinclude](https://devopstutodoc.readthedocs.io/en/latest/documentation/doc_generators/sphinx/rest_sphinx/code/literalinclude/literalinclude.html)