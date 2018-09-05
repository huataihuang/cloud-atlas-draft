遇到一个简单的脚本需求，判断文件中每一行是否都是数字，如果存在非数字（如字母），就需要提示。

参考[shell 判断变量为数字的N种方法](http://www.linuxidc.com/Linux/2013-11/93334.htm)提供的2个比较巧妙的方法：

* 方法一：通过`expr`计算变量和一个整数相加，如果能正常执行则为整数，否则执行出错。`$?`是非零值：

```bash
expr $args + 0 &>/dev/null
```

* 方法二（此方法更简便清晰）：通过`sed`替换变两种的数字为空，如果执行过后变量完全变空，则表明是整数。

```
echo $args | sed 's/[0-9]//g'
```

结合上述方法二，这里一段脚本判断文件中每一行是否是数值:

```bash
function check_file_all_num(){
    FILENAME=$1
    CHECK_FILE_NUM=`cat $FILENAME | sed 's/[0-9]//g' | grep -v "^$"`
    if [ -n "$CHECK_FILE_NUM" ]; then
        echo "$FILENAME is not all number" > /dev/null
        return 1
    fi
}
```

> `[ -n "$CHECK_FILE_NUM" ]` 的含义是判断字符串是否为null值 - [shell中判断字符串null值](check_string_variable_is_null)

不过，上述方法只能判断整数，对于小数或者符号数值存在偏差

# 通过正则表达式判断字符串是否是数值

```bash
re='^[0-9]+$'
if ! [[ $yournumber =~ $re ]] ; then
   echo "error: Not a number" >&2; exit 1
fi
```

如果要判断小数

```
^[0-9]+([.][0-9]+)?$
```

带符号小数

```
^[+-]?[0-9]+([.][0-9]+)?$
```

# 通过`-eq`数值运算符来判断是否是整数

在shell中，如果非整数，数值比较运算符`-eq`就会报错，可以用这个方法来判断是整数还是字符串：

```bash
#!/bin/bash

var=a

if [ "$var" -eq "$var" ] 2>/dev/null; then
  echo number
else
  echo not a number
fi
```

# 参考

* [How do I test if a variable is a number in Bash?](https://stackoverflow.com/questions/806906/how-do-i-test-if-a-variable-is-a-number-in-bash)