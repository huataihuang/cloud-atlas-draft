在脚本中经常需要检查字符串长度，bash提供了多种方法:

```bash
${#strvar}
expr length $strvar
expr “${strvar}”:’.*’
echo $strvar | wc -c
echo $strvar |awk '{print length}'
```

# 使用 "#" 符号计算字符串长度(推荐)

最常用的shell字符串长度计算是使用符号 `#` :

```bash
string="Learn Bash Programming with LinuxHint"
echo ${#string}
```

# 使用 `expr` 来计算字符串长度

`expr` 命令可以计算字符串长度

```bash
string="Hypertext Markup Language"
len=`expr length "$string"`
echo "The length of string is $len"
```

> 通用性差些，在macos的zsh上语法不兼容

# 使用 `wc` 统计字符串长度(不推荐)

`wc` 命令的 `-c` 参数可以计算字符串长度:

```bash
string="Hypertext Markup Language"
echo $string | wc -c
```

> 使用 `wc -c` 统计不准确 很奇怪

# 使用 `awk` 加笋字符串长度

```bash
string="Hypertext Markup Language"
echo $strvar |awk '{print length}'
```

# 参考

* [Find Length of String in Bash](https://linuxhint.com/length_of_string_bash/)