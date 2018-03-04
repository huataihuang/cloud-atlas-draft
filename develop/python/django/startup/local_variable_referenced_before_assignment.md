

代码如下：

```python
    def _Create(self):
        ...
        INSTANCETYPE_STRING=self.machine_type
        cpu_base_set = {"SMALL": 1, "MEDIUM": 2, "LARGE": 4}
        for typeKey in cpu_base_set.keys():
            if typeKey in INSTANCETYPE_STRING:
                cpu_base = cpu_base_set[typeKey]
                type_base = typeKey

        instance_type_all = INSTANCETYPE_STRING.split(".")[1]
        instance_type_cpu, instance_type_mem = instance_type_all.split(type_base)       # 异常报错在这一行
        if "X" in instance_type_cpu:
            cpu_multiple = instance_type_cpu.split("X")[0]
            instance_cpu = cpu_base * cpu_multiple
        else:
            instance_cpu = cpu_base

        instance_mem = instance_type_mem
```

> 代码简单说明：

* `INSTANCETYPE_STRING`字符串是虚拟机实例的规则，字符串类似`S2.2XLARGE16`
* `cpu_base_set`使用字典结构，表示规格关键字和VCPU的计算基数映射关系，例如`LARGE`关键字表示计算技术是4个VCPU
* `typeKey`遍历`cpu_base_set`字典的每个key，取出key对比是否包含在`INSTANCETYPE_STRING`中，如果包含，则将对应VCPU数量赋值给`cpu_base`；同时记录下此时的`typeKey`给`type_base`这样就知道这个实例的类型，例如`LARGE`
* `instance_type_all.split(type_base)`是为了将字符串`instance_type_all`(`2XLARGE16`)中`LARGE`前后的字符`2X`（2倍`cpu_base`）和数字`16`提取出来（内存大小）

Python程序执行过程抛出异常，其中显示本地变量在分配前被引用错误：

```
UnboundLocalError: local variable 'type_base' referenced before assignment
```

在[What are the rules for local and global variables in Python?](https://docs.python.org/3/faq/programming.html#why-am-i-getting-an-unboundlocalerror-when-the-variable-has-a-value)介绍了类似的在一个函数中仅仅加了一个设置状态就会导致原先可以工作的代码出现`UnboundLocalError`异常，和这里的报错非常相似：

原先的可工作代码

```python
>>> x = 10
>>> def bar():
...     print(x)
>>> bar()
10
```

修改后导致异常代码

```python
>>> x = 10
>>> def foo():
...     print(x)
...     x += 1


>>> foo()
Traceback (most recent call last):
  ...
UnboundLocalError: local variable 'x' referenced before assignment
```

这是因为当你在一个作用域范围(scope)内设置变量，这个变量就会成为这个scope的local变量，并且影响（shadow）其他scope的任何相似命名的变量。由于在`foo`函数中最后的声明设置一个新的值给`x`，这样编译器就识别它作为一个本地变量。而在这之前`print(x)`试图答应这个还没有初始化的本地变量就会导致错误。

> 可以这样理解：如果在一个作用域（函数）内如果设置变量，这个变量就会被编译器识别local变量。此时就需要确保这个local变量在设置前没有被引用，否则就会出现`UnboundLoaclError`。

以上案例我们可以通过声明`x`变量为`global`，这样就可以访问scope之外的变量`x = 10`

```python
>>> x = 10
>>> def foobar():
...     global x
...     print(x)
...     x += 1
...     print(x)
...
>>> foobar()
10
11
>>> print(x)
11
```

可以看到在scope之变量也可以修改。

另外，在Python 3中，还有一个`nonlocal`关键字可以实现相似功能：

```python
>>> def foo():
...    x = 10
...    def bar():
...        nonlocal x
...        print(x)
...        x += 1
...    bar()
...    print(x)
>>> foo()
10
11
```

# Python中的本地和全局变量规则

在Python中，变量只在一个函数中引用（只使用不赋值）的是隐含全局。如果变量在函数体内部任何一个位置被赋值，就会被假设为本地变量，除非其明确声明为全局变量。

# 解决

参考了[What are the rules for local and global variables in Python?](https://docs.python.org/3/faq/programming.html#why-am-i-getting-an-unboundlocalerror-when-the-variable-has-a-value)，尝试修改：

```python
    def _Create(self):
        """Create a VM instance."""
        global cpu_base
        global type_base
        cpu_base = ""
        type_base = ""
        ...
        INSTANCETYPE_STRING=self.machine_type
        cpu_base_set = {"SMALL": 1, "MEDIUM": 2, "LARGE": 4}
        for typeKey in cpu_base_set.keys():
            if typeKey in INSTANCETYPE_STRING:
                cpu_base = cpu_base_set[typeKey]
                type_base = typeKey

        instance_type_all = INSTANCETYPE_STRING.split(".")[1]
        instance_type_cpu, instance_type_mem = instance_type_all.split(type_base)       # 异常报错在这一行
        if "X" in instance_type_cpu:
            cpu_multiple = instance_type_cpu.split("X")[0]
            instance_cpu = cpu_base * cpu_multiple
        else:
            instance_cpu = cpu_base

        instance_mem = instance_type_mem
```

这里在函数`_Create(self)`的前面首先申请变量`cpu_base`和`type_base`是全局变量，可以绕过这个问题。

但是，为何这里会出现异常的`UnboundLoaclError`呢？明明使用``



# 参考

* [What are the rules for local and global variables in Python?](https://docs.python.org/3/faq/programming.html#why-am-i-getting-an-unboundlocalerror-when-the-variable-has-a-value)