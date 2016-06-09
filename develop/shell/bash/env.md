# 脚本中的PS1

遇到一个很奇怪的问题，想在shell脚本中使用`$PS1`中的内容

```bash
#!/bin/bash

INFO=`echo $PS1 | awk '{print $2}'`
echo $INFO
```

结果发现输出是空的，即使直接在脚本中`echo $PS1`也是空的。

但是，明明在终端中执行`echo $PS1`是能够输出内容的。这是为何？

**原来shell脚本并不会直接去读取`/etc/profile`/`~/.bashrc`这样的环境脚本，需要在脚本开头显式地`.`引用**


```bash
#!/bin/bash

. /etc/profile

INFO=`echo $PS1 | awk '{print $2}'`
echo $INFO
```

# 参考

* [bash shell中的PS1,PS2,PS3,PS4以及PROMP_COMMAND](http://ju.outofmemory.cn/entry/147026)

删除"\n$"失败