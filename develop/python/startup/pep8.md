# continuation line under-indented for visual indent

在使用 sublime simple python studio 时，发现遵循 PEP8 编写代码换行，但是发现提示

"continuation line under-indented for visual indent?" 原因是Python规范希望在开放的圆括号中间对齐：

```
urlpatterns = patterns('',
                       url(r'^$', listing, name='investment-listing'))
```

不应该是

```
urlpatterns = patterns(
    '',
    url(r'^$', listing, name='investment-listing'),
)

urlpatterns = patterns(
    '', url(r'^$', listing, name='investment-listing'))
```

> 不过`PEP8`要求单行字符不超过79却是比较难以遵守，我发现我设置函数以及变量有时候一个函数就导致超出了79个字符（为了能够比较容易理解使用了较长的多个单词组合），所以将这个行字符限制放宽到120字符。

# 参考

* [What is PEP8's E128: continuation line under-indented for visual indent?](http://stackoverflow.com/questions/15435811/what-is-pep8s-e128-continuation-line-under-indented-for-visual-indent)