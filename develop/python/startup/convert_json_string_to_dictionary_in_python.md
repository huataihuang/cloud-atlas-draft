JSON是非常常用的数据交换格式，在很多程序脚本执行结果也输出为JSON格式。JSON格式的字符串特别适合转换成Python的字典：

```python
import json    # or `import simplejson as json` if on Python < 2.6

json_string = u'{ "id":"123456789", ... }'
obj = json.loads(json_string)    # obj now contains a dict of the data
```

如果字符串不是JSON格式，但是也有规则的分割符。则可以使用Python内置的[ast.literal_eval](https://docs.python.org/library/ast.html#ast.literal_eval)做转换：

```python
>>> import ast
>>> ast.literal_eval("{'muffin' : 'lolz', 'foo' : 'kitty'}")
{'muffin': 'lolz', 'foo': 'kitty'}
```

# 参考

* [String to Dictionary in Python](https://stackoverflow.com/questions/4917006/string-to-dictionary-in-python)
* [Convert a String representation of a Dictionary to a dictionary?](https://stackoverflow.com/questions/988228/convert-a-string-representation-of-a-dictionary-to-a-dictionary)