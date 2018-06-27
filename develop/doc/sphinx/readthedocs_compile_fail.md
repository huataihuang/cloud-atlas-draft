当撰写好的sphinx文档上传到github，并同步到readthedocs.org，此时会发现编译错误，这是因为默认打开到pdf和epub选项是基于LaTex的，对字体处理有要求。

解决的方法是编辑`conf.py`，修改`latex_elements`设置段落：

```python
latex_elements = {
# The paper size ('letterpaper' or 'a4paper').
#'papersize': 'letterpaper',
 
# The font size ('10pt', '11pt' or '12pt').
#'pointsize': '10pt',
 
# Additional stuff for the LaTeX preamble.
#'preamble': '',
'preamble': r'''
\hypersetup{unicode=true}
\usepackage{CJKutf8}
\DeclareUnicodeCharacter{00A0}{\nobreakspace}
\DeclareUnicodeCharacter{2203}{\ensuremath{\exists}}
\DeclareUnicodeCharacter{2200}{\ensuremath{\forall}}
\DeclareUnicodeCharacter{2286}{\ensuremath{\subseteq}}
\DeclareUnicodeCharacter{2713}{x}
\DeclareUnicodeCharacter{27FA}{\ensuremath{\Longleftrightarrow}}
\DeclareUnicodeCharacter{221A}{\ensuremath{\sqrt{}}}
\DeclareUnicodeCharacter{221B}{\ensuremath{\sqrt[3]{}}}
\DeclareUnicodeCharacter{2295}{\ensuremath{\oplus}}
\DeclareUnicodeCharacter{2297}{\ensuremath{\otimes}}
\begin{CJK}{UTF8}{gbsn}
\AtEndDocument{\end{CJK}}
''',
}
```

这里要注意的是，这段代码是配置LaTex，所以这些字符串必须加r，不要让pyhton解释。

所以务必检查一下几项：

* 不要全局导入`__future__.unicode_literals`，这会让这段代码编程unicode解释，readthedocs编译的时候会出字符问题。
* 检查项目中全局替换的部分(例如`rst_epilog`），如果修改到源文件，那么务必手动添加u前缀，否则会出现编码错误。

# 参考

* [解决在readthedocs编译PDF含中文的问题](https://www.kawabangga.com/posts/2331) - 本文即转载自这片文档，测试有效
* [使用ReadtheDocs托管文档](https://www.xncoding.com/2017/01/22/fullstack/readthedoc.html) - 非常详细的RedtheDocs托管介绍，建议参考
