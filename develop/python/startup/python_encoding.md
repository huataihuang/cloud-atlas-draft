源代码文件作为文本文件就必然是以某种编码形式存储代码的，python默认会认为源代码文件是asci编码，所以如果在代码中使用了中文（utf），则执行时会提示如下错误

```
SyntaxError: Non-ASCII character '\xe5' in file ./check_kvm_qemu_cpu on line 143, but no encoding declared; see http://www.python.org/peps/pep-0263.html for details
```

解决的方法是在代码的前端第2行添加(第一行是`#!/usr/bin/python`)

```
# -*- coding: utf-8 -*-
```

# 参考

* [PEP 263 -- Defining Python Source Code Encodings](https://www.python.org/dev/peps/pep-0263/)
* [Python中文编码问题](http://www.cnblogs.com/ymy124/archive/2012/06/23/2559282.html)