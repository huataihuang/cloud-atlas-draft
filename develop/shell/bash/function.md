
# 向function传递参数

shell中函数function的参数和直接调用shell的参数没有什么太大差别： `function_name "$arg1" "$arg2"`。主要是需要注意：函数必须先定义，然后才能调用：

```bash
#!/usr/bin/env sh

foo 1  # this will fail because foo has not been declared yet.

foo() {
    echo "Parameter #1 is $1"
}

foo 2 # this will work.
```

输出：

```
./myScript.sh: line 2: foo: command not found
Parameter #1 is 2
```

以下举一个记录debug日志的案例：

```bash
# Debug log file
DEBUG_LOG=/tmp/my_debug.log-`date +%Y%m%d`

function debug() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $@" >> $DEBUG_LOG
}
```

# 在function中返回布尔值

function返回布尔值可以使用`true`和`false`，也可以返回`0`或者`1`，以下3种function案例都可以：

```bash
isdirectory() {
if [ -d "$1" ]; then
    true
else
    false
fi
}
```

```bash
#!/bin/bash

isdirectory() {
if [ -d "$1" ]; then
    # 0 = true
    return 0 
else
    # 1 = false
    return 1
fi
}
```

> 下面这个案例打字更少

```bash
isdirectory() {
  [ -d "$1" ]
}
```

在shell主程序中可以使用如下方法

```bash
if isdirectory $1; then
    echo "is directory"
else
    echo "nopes"
fi
```

# 参考

* [Returning a boolean from a Bash function](https://stackoverflow.com/questions/5431909/returning-a-boolean-from-a-bash-function)
* [Passing parameters to a Bash function](https://stackoverflow.com/questions/6212219/passing-parameters-to-a-bash-function)