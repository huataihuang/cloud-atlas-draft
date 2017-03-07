

# `ValueError: Attempted relative import in non-package`

程序目录

```
perform/
  __init__.py
  toolkit/
    conf_parse.py
    __init__.py
  cgroup/
    cg_config.py
    __init__.py
```

在编写遵循[PEP 328](https://www.python.org/dev/peps/pep-0328/)，采用了相对路径方式import上层目录中的`conf_parse`

```
from ..toolkit import conf_parse
```

但是出现以下报错

```
Traceback (most recent call last):
  File "./cg_config.py", line 10, in <module>
    from ..toolkit import conf_parse
ValueError: Attempted relative import in non-package
```

参考了另外一种方法，在`cg_config.py`使用如下方法将目录移动到上级目录，然后执行import

```
import sys
sys.path.append("..")
from toolkit import conf_parse
```

# 参考

* [How to fix “Attempted relative import in non-package” even with __init__.py](http://stackoverflow.com/questions/11536764/how-to-fix-attempted-relative-import-in-non-package-even-with-init-py)
* [ValueError: Attempted relative import in non-package](http://www.cnblogs.com/DjangoBlog/p/3518887.html)