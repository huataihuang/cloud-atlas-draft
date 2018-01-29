在Shell中，会使用

```bash
fuction func_1(){
    ....
}
```

如果在`function`中，有某些判断后结束function不再执行后面部分，例如：

```bash
# Start script
Do scripty stuff here
Ok now lets call FUNCT
FUNCT
Here is A to come back to

function FUNCT {
  if [ blah is false ]; then
    exit the function and go up to A
  else
    keep running the function
  fi
}
```

则应该使用`return [n]`方法，从`help return`可以看到：

`return`可以从一个shell函数中返回指定的`n`数值。如果没有指定`n`，则返回值是函数或脚本最后执行命令的返回值。

# 参考

* [How to exit a function in bash](https://stackoverflow.com/questions/18042279/how-to-exit-a-function-in-bash)