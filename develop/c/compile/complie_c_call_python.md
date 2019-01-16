在项目原型阶段，使用Python或者shell来验证程序逻辑和方案是非常快捷的开发方法。而且可以在原型完善以后，通过C语言重写方式来提高性能。

不过，在C/C++代码中嵌入Python，最初也遇到一些问题，记录如下。

> 我在编译嵌入Python的C程序就遇到过无法找到头文件，以及链接程序的错误，这里为了简化，采用了Python 2.7官方文档[Embedding Python in Another Application](https://docs.python.org/2/extending/embedding.html#very-high-level-embedding)的样例：

```c
#include <Python.h>

int
main(int argc, char *argv[])
{
  Py_SetProgramName(argv[0]);  /* optional but recommended */
  Py_Initialize();
  PyRun_SimpleString("from time import time,ctime\n"
                     "print 'Today is',ctime(time())\n");
  Py_Finalize();
  return 0;
}
```

我最初尝试设置

```
CPPFLAGS=-I/usr/include/python2.7
LDFLAGS=-L/usr/lib/python2.7
```

但是依然失败

* 设置编译环境

> 参考 [Can't find Python.h already installed python-dev](https://ubuntuforums.org/showthread.php?t=2109341)

```bash
C_INCLUDE_PATH=/usr/include/python2.7
export C_INCLUDE_PATH
LD_LIBRARY_PATH=/usr/lib/python2.7
export LD_LIBRARY_PATH
```

果然不再报告找不到`Python.h`头文件了

另外一种解决方法参考 [Call Python from within C](https://www.raspberrypi.org/forums/viewtopic.php?t=136743) 使用

```c
#include <python2.7/Python.h>
```

但是改成报错

```
/cn_nfs/libvirt-kvm/src/qemu/``qemu_driver.cqemuDomainMigratePrepare3Params:13991: undefined reference to `Py_Initialized'
/cn_nfs/qemuDomainMigratePrepare3Paramslibvirt'-kvm/src/qemu/qemu_driver.c:13992: undefined reference 'to: `Py_IsInitialized'
/cn_nfs/libvirt-kvm/src/qemu/:
qemu_driver.c:13999: undefined reference to `Py_Finalize'

//cn_nfs/libvirt-kvm/src/qemu/cn_nfsqemu_driver.c/:13991libvirt:-kvm/src/qemu /qemu_driver.c:13991undefined: undefined  reference to `referencePy_Initializedcollect2: error: ld returned 1 exit status
```

参考 [Undefined reference - despite lib being found by linker](https://stackoverflow.com/questions/13951166/undefined-reference-despite-lib-being-found-by-linker) ，是因为Py_Initialize需要符号表，从 libpython2.7.a加载，则需要传递编译参数 `-lpython2.7`

不过，依然报错。

https://ubuntuforums.org/showthread.php?t=987124 有一个解决方法

```
$ gcc test.c -o test -lpython2.5 -lm -L/usr/lib/python2.5/config/ -I/usr/include/python2.5/
$ ./test
Today is Thu Nov 20 01:05:17 2008
```

类似 https://bbs.csdn.net/topics/392185678 也是同样解决思路。

修改了环境参数，将

```
LDFLAGS="-Wl,--as-needed" \
 PYTHON=/usr/bin/python
```

修改成

```
LDFLAGS="-Wl,--as-needed -lpython2.7" \
PYTHON=/usr/bin/python
```

就可以编译成功

另外，参考 https://ubuntuforums.org/showthread.php?t=987124 的简单代码 （实际上是 https://docs.python.org/2/extending/embedding.html#very-high-level-embedding ）

```python
#include <Python.h>

int
main(int argc, char *argv[])
{
  Py_SetProgramName(argv[0]);  /* optional but recommended */
  Py_Initialize();
  PyRun_SimpleString("from time import time,ctime\n"
                     "print 'Today is',ctime(time())\n");
  Py_Finalize();
  return 0;
}
```

# 参考

* [Embedding Python in Another Application](https://docs.python.org/2/extending/embedding.html#very-high-level-embedding)