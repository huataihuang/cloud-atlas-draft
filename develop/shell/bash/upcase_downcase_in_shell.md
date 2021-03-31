Shell中转换字符串大小写，可以通过 `tr` 工具，也可以使用 `typeset` 工具，甚至在bash 4中内置了转换字符串大小小的功能。本文分别做一些案例解析。

# tr

`tr` 是一个非常古老的unix命令，提供了字符串转换和删除字符功能。可以使用这个命令来做搜索和替换文本，以及将字符串转换成大写或消协，以及删除字符串汇中重复字符。

`tr` 语法:

```bash
tr [option] stringValue1 [stringValue2]
```

> `tr` 命令内置了一些代表符号，我觉得语法比较清晰，推荐使用： `[:upper:]` , `[:lower:]` , `[:space:]` ，特别适合编写脚本

* 转换成全大写字母

```
echo down2up | tr '[a-z]' '[A-Z]'
```

或者使用

```
echo down2up | tr a-z A-Z
```

或者使用

```
echo down2up | tr [:lower:] [:upper:]
```

输出 `DOWN2UP`

* 转换成全小写字母

```
echo UP2DOWN | tr '[A-Z]' '[a-z]'
```

或者使用

```
echo UP2DOWN | tr A-Z a-z
```

或者使用

```
echo UP2DOWN | tr [:upper:] [:lower:]
```

输出 `up2down`

* 我们通常会用以下的脚本方式

```
tr [:upper:] [:lower:] < items.txt > output.txt
```

# 字符替换(类似 `sed` )

## 替换空格

`tr` 可以用来替换字符串，例如，我们经常要将字符串中的空白替换成换行:

```bash
echo "Hello world!" | tr [:space:] '\n'
```

输出就是

```
Hello
world!
```

## 替换所有不匹配字符(不常用) `-c` (表示反转)

`tr` 命令可以使用 `-c` 参数来替换字符串中 **所有** 不符合的字符。

举例:

```bash
echo "bash" | tr -c 'b' 'a'
```

上述字符串 `bash` 中只有第一个字幕 `b` 符合，其他字符都不是 `b` ，所以都会被替换成 `a` 。不过，需要注意，替换结果输出是 

```
baaaa
```

为什么是4个 `a` 呢？因为 `bash` 字符串最后还有一个看不到的换行符 `\n` 也被替换成 `a`

## 替换指定字符(常用) `-s`

我们经常需要替换整个字符串中指定的某个字符，例如，我们需要把字符串中的 `空格` 替换成 `tab` 字符，并且我们需要重复替换只合并替换一次。以下字符串 `Bash         programming` 中间有10个空格，我们替换成 **一个** `tab` 字符

```bash
echo "Bash         programming" | tr -s ' ' '\t'
```

输出就是

```bash
Bash	programming
```

## 结合 `-c` 和 `-s`

* `items.txt` 文本如下

```
01. Monitor
02. Keyboard
03. Mouse
04. Sanner
05. HDD
```

* 执行以下命令可以把所有非小写字符都替换成换行，并且合并只替换一次

```bash
tr -cs [a-z] "\n" < items.txt > output.txt
```

则输出的 `output.txt` 内容就是

```

onitor
eyboard
ouse
anner
```

## 删除字符

`-d` 选项提供了删除字符功能，并且提供了只要匹配就删除：

```bash
echo "Python is a Programming language" | tr -d 'Pyt'
```

输出中所有和 `P` `y` `t` 匹配的字符都被删除

```
hon is a rogramming language
```

结合 `-c` 和 `-d` 可以删除所有 **不匹配** 的字符( `-d` 是删除所有匹配字符，加上 `-c` 反转一下，就变成了删除 **不匹配** )。例如，我们要删除所有非数字的字符：

```
echo "Phone No: 985634854" | tr -cd '0-9'
```

则输出就是

```
985634854
```

结合 `-c` 和 `-d` 还可以删除掉文本中不可打印的字符

```bash
tr -cd "[:print:]" < items.txt
```

此时输出就是

```
01. Monitor02. Keyboard03. Mouse04. Sanner05. HDD
```

也就是换行符被删除掉了

# typeset

```bash
typeset -u VARIABLE  #把VARIABLE的小写转换成大写
typeset -l  VARIABLE #把VARIABLE的大写转换成小写
```

举例：

```bash
typeset -u VARIABLE
VARIABLE="True"
echo $VARIABLE
```

输出 `TRUE`

# 使用bash内置的大小写转换

在Bash 4中引入了一个新的更为容易使用的字符大小写转换功能:

* `^` 表示转换字符串的第一个字符 **大写**
* `^^` 表示转换所有字符 **大写** ，如果要指定字符，则需要使用正则 
* `,` 表示转换字符串的第一个字符 **小写**
* `,,` 表示转换所有字符 **小写** ，如果要指定字符，则需要使用正则 

**警告：是字符串不是单词，例如 `linux hint` 被视为 `一个` 字符串，转换符号 `^` 只对第一个字母 `l` 起效果**

* 大写转换

```bash
name='fahmida'
echo $name
echo ${name^}
echo ${name^^}
```

对应输出就是

```
fahmida
Fahmida
FAHMIDA
```

* 小写转换

```bash
site='linuxhint'
echo $site
echo ${site^l}
echo ${site^h}
```

注意，上面大写转换分别指定 `l` 字母和 `h` 字母，但是你会发现，只转换成功 `L` ，而 `h` 没有转换成功，原因是 `^` 只能转换 **字符串** 的第一个字母

```
Linuxhint
linuxhint
```
 
注意，字符串之后第一个字母才有效，例如

```bash
site='linux hint'
echo $site
echo ${site^l}
echo ${site^h}
```

输出依然是

```
linux hint
Linux hint
linux hint
```

```bash
language='python perl java php c#'
echo $language
echo ${language^^p)}
echo ${language^^[p,j]}
```

注意 `^^` 是正则，需要使用正则 `[]` 才能有效，输出如下

```
python perl java php c#
python perl java php c#
Python Perl Java PhP c#
```

## 格式化用户输入的案例

* 以下脚本 `case1.sh` 将用户输入的字符读入以后转换第一个字母大写

```bash
#!/bin/bash
read -p "Do you like music? " ans
answer=${ans^}
echo "Your answer is $answer."
```

执行：

```
$./case1.sh
Do you like music? yes
Your answer is Yes.
```

* 以下脚本对用户输入对字符串做了统一转换成大写以后再做字符串比较，这样就可以忽略掉用户大小写输入进行匹配

```bash
#!/bin/bash
a=15
b=20
read -p "Do you want to add or subtract? " ans
answer=${ans^^}
if [ $answer == 'ADD' ]; then
echo "The result of addition=$((a+b))"
elif [ $answer == 'SUBTRACT' ]; then
echo "The result of subtraction=$((a-b))"
else
echo "Invalid answer"
fi
```

* 以下脚本允许用户输入指定字符来调整一个字符串中的字母大写

```bash
#!/bin/bash
read -p "Enter some text data: " data
read -p "Mention the letters with the comma that will convert to uppercase?: " list
echo -n "The highlighted text is :  "
echo ${data^^[$list]}
```

执行案例

```
$bash case3.sh
Enter some text data: welcome to west world
Mention the letters with the comma that will convert to uppercase?: w,d
The highlighted text is :  Welcome to West WorlD
```

* 以下脚本转换用户输入的字符串，都转换成小写进行对比

```bash
#!/bin/bash
username='admin'
password='pop890'
read -p "Enter username: " u
read -p "Enter password: " p
user=${u,,}
pass=${p,,}
if [ $username == $user ] && [ $password == $pass ]; then
echo "Valid User"
else
echo "Invalid User"
fi
```

# 参考

* [shell中大小写转换](https://blog.csdn.net/shandianling/article/details/17394511)
* [Bash tr command](https://linuxhint.com/bash_tr_command/)
* [Bash lowercase and uppercase strings](https://linuxhint.com/bash_lowercase_uppercase_strings/)