Python的解释器有一个自动完成功能可以方便开发工作。有时候你可能不记得一个方法的名字，或者你不确定该使用那个方法，就可以借用`auto-complete`功能。

* 首先在自己的HOME目录下创建一个名为`.pythonrc`的文件：

```python

import rlcompleter, readline
readline.parse_and_bind('tab:complete')
```

* 然后在自己的环境配置中添加`PYTHONSTARTUP`变量

```bash
echo "export PYTHONSTARTUP=~/.pythonrc" >> ~/.bashrc
```

* 激活环境变量：

```bash
source ~/.bashrc
```

* 现在我们可以来启动一个python解释器，然后测试

```python
import sys
```

然后再输入`sys.`之后，连续按下`２`次`tab`键，就可以看到所有和`sys`对象相关的方法提示：

```python
>>> sys.
sys.__class__(              sys.argv                    sys.maxint
sys.__delattr__(            sys.builtin_module_names    sys.maxsize
...
```

# 参考

* [Enable auto-complete in python interpreter](http://web.archive.org/web/20160403063600/http://conjurecode.com/enable-auto-complete-in-python-interpreter/)