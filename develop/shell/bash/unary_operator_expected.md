在一个shell脚本中，原先采用了比较字符串变量

```bash
if [ $nc_id = $nc_id_1 ];then
...
else
...
fi
```

工作正常。

但是将上述这段比较代码放到脚本的`function compare() {...}`段落中：

```bash
function compare() {
    if [ $nc_id = $nc_id_1 ];then
    ...
    else
    ...
    fi  
}
```

意外发现，执行时提示错误

```
./check_string.sh: line 64: [: =: unary operator expected
```

参考 [unary operator expected](https://stackoverflow.com/questions/13617843/unary-operator-expected) 中有说明，如果是`bash`，通常使用双括号来判断 `[[ ... ]]` 而不是Posix兼容的单括号 `[ ... ]`。使用双括号 `[[ ... ]]` 可以不用在变量两边加上双引号，如`"$nc_id"`：

```bash
    if [[ $nc_id == $nc_id_1 ]];then
```

但是，如果使用Posix兼容的`[ ... ]`，则变量两边需要使用双引号，例如：

```bash
if [ "$aug1" = "and" ];
```

如果没有使用双引号扩起变量，则变量会被unefined或者空白，也就是变成：

```bash
if [ = "and" ];
```

此时就会出现语法错误。

所以上述脚本改成

```bash
if [ "$nc_id" = "$nc_id_1" ];then
```

> 注意：POSIX兼容的shell，在比较符号`=`两边的变量都需要使用`" "`：
>
> `=`前变量不使用引号会报错`[: =: unary operator expected`
>
> `=`后变量不使用引号则会报错`[: too many arguments`

或者索性改成bash

```bash
if [[ $nc_id == $nc_id_1 ]];then
```

# 参考

* [unary operator expected](https://stackoverflow.com/questions/13617843/unary-operator-expected)