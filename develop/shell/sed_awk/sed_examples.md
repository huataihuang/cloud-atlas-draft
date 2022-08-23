> 一直没有系统学习过`sed`，这里是一些例子的汇总整理，快刀斩乱麻......

样例文本`file`内容如下

```
Cygwin
Unix
Linux
Solaris
AIX
```

* 删除文件中指定行

例如删除第1行

```bash
sed '1d' file
```

删除第3行

```bash
sed '3d' file
```

> 上述`sed`命令是直接将`sed`修改后的内容出处到标准输出（屏幕）上，而源文件不变。要更新源文件，需要加上`-i`参数。例如：

```bash
sed -i '3d' file
```

> `sed`是将源文件复制后修改，所以`-i`参数实际是修改后覆盖源文件

在 `sed` 中， `$` 代表最后一行，所以删除最后一行可以使用如下命令:

```bash
sed '$d' file
```

此外， `head` 命令提供了一个更好的删除最后几行的方法， `-n -X` ：通常 `-n X` 表示打印前X行，当 `X` 前面加上 `-` 则表示倒过来，即打印所有行但不包括最后的X行，也就是输出内容少了最后 `X` 行，所以定向到新文件就能截断原文件的最后 `X` 行(以下案例去除了file.txt文件的最后3行生成new_file.txt):

```bash
cat file.txt | head -n -3 > new_file.txt
```

删除第2行到第四行

```bash
sed '2,4d' file
```

保留第2行到第4行，删除其余行（反转选择就是加上`!`符号）

```bash
sed '2,4!d' file
```

这里输出就是

```bash
Unix
Linux
Solaris
```

删除第1行和最后一行（注意：每一行之间用`;`分隔）

```bash
sed '1d;$d' file
```

> 同上，如果要删除第2行和第4行，就使用`'2d;3d'`

* 匹配并删除

删除带有一个特定字符开头的行，例如，`L`开头的行

```bash
sed '/^L/d' file
```

这里输出就是 

```
Cygwin
Unix
Solaris
AIX
```

删除`x`结尾的行

```bash
sed '/x$/d' file
```

还支持正则，例如，要删除`x`或`X`结尾的行

```bash
sed '/[xX]$/d' file
```

删除文件中的空白行

```bash
sed '/^$/d' file
```

> `^`表示开头，`$`表示结尾，由于中间没有任何字符，就是空白行

删除空白行或者包含一些空格的行

```bash
sed '/^ *$/d' file
```

> 这里`*`表示0个或者多个重复的前一个字符，这里前一个字符是空格，所以这里` *`就表示有一个空格或者多个空格。此时会删除完全空白行，以及包含一个或多个空格的空白行。

删除全部是大写字符的行（这里会删除`AIX`行）

```bash
sed '/^[A-Z]*$/d' file
```

> `[A-Z]`表示全部大写字母，后面跟了`*`表示前面的`[A-Z]`字符重复（任意大写字符），也就是表示整行都是大写字符，所以就删除了`AIX`

删除**没有**包含字符串`Unix`的行

```bash
sed '/Unix/!d' file
```

删除包含`Unix`或`Linux`的行（或的符号是`|`，注意需要加转义符）

```bash
sed '/Unix\|Linux/d' file
```

删除从第一行到匹配上`Linux`的行

```bash
sed '1,/Linux/d' file
```

输出的结果是

```bash
Solaris
AIX
```

删除从匹配`Linux`行到文档最后行

```bash
sed '/Linux/,$d' file
```

如果最后一行包含了`AIX`，则删除最后一行（如果最后一行是其他内容则不删除）

```bash
sed '${/AIX/d;}' file
```

输出内容是

```
Cygwin
Unix
Linux
Solaris
```

> 这里`$`表示最后一行，只在这行包含了`AIX`才删除，这里引入了`if`判断（也就是`{}`表示`if`条件）

如果最后一行包含了`AIX`或者`HPUX`则删除最后一行

```bash
sed '${/AIX\|HPUX/d;} file
```

只在第1行到第4行之间出现`Solaris`字符串匹配情况下删除这行：

```bash
sed '1,4{/Solaris/d;}' file
```

如果一行中包含了`Unix`关键字，则删除这行和下面一行

```bash
sed '/Unix/{N;d;}' file
```

> 这里`N`命令读取匹配行的下一行，而`d`命令则删除匹配行和下一行

上述命令输出是

```
Cygwin
Solaris
AIX
```

只删除包含了`Unix`的下一行（但`Unix`行不删除）

```bash
sed '/Unix/{N;s/\n.*//;}' file
```

输出内容是

```
Cygwin
Unix
Solaris
AIX
```

[sed - 25 examples to delete a line or pattern in a file](http://unix-school.blogspot.com/2012/06/sed-25-examples-to-delete-line-or.html)原文还有3个例子较为复杂：

删除匹配行和匹配行之前的行

```bash
sed -n '/Linux/{s/.*//;x;d;};x;p;${x;p;}' file | sed '/^$/d'
```

删除包含`Linux`的行之前的行，但不删除'Linux'行：

```bash
sed -n '/Linux/{x;d;};1h;1!{x;p;};${x;p;}' file
```

删除包含`Linux`行以及之前的行和之后好的行

```bash
sed -n '/Linux/{N;s/.*//;x;d;};x;p;${x;p;}' file | sed '/^$/d'
```

* 合并重复的空格成一个空格

在使用`cut`工具来截取`ps`出来的进程的`pid`，会遇到一个问题，就是每列之间的空格数量是不一定的，这样虽然可以通过`awk`来截取，但是蹪于`cut`命令就不行了。解决的方法是将多个空格合并成一个空格，`sed`命令提供了这个功能：

```bash
ps axu | grep '[j]boss' | sed 's/\s\+/ /g' | cut -d' ' -f2
```

> 这里使用的是GNU sed，这个sed提供了`\s`表示空格（扩展），`\+`表示多个空格

或者

```bash
ps axu | grep '[j]boss' | sed 's/\s\s*/ /g' | cut -d' ' -f2
```

> 不过，在OS X中，需要传递`-E`参数来激活sed扩展正则表达式，然后使用`[[:space:]]`来代替`\s`，也就是

```bash
ps axu | grep '[j]boss' | sed -E 's/[[:space:]]+/ /g' | cut -d' ' -f2
```

> 请参考[cut使用举例](../utilities/cut_examples.md)

* 替换换行符（`\n`）: 读取整个文件替换换行符成一个空格

```bash
sed ':a;N;$!ba;s/\n/ /g'
```

> 首先创建一个label `:a`
>
> 通过`N`将当前行和下一行通过空格连接
>
> 如果到了最后一行，则创建label `$!ba` （这里`$!`表示不在最后一行做这个操作）
>
> 最后使用在模式坑拜拜中的空格来替换每个换行符

**上述方法实在太拗口**，其实可以使用`tr`工具来实现这个任务

```bash
tr '\n' ' ' < input_filename
```

或者

```bash
tr --delete '\n' < input.txt > output.txt
```

* 在匹配行的最后添加内容

```
sed -i '/kernel \/boot/s/$/ clocksource_failover=acpi_pm/' /boot/grub/grub.cfg

sed -i '/vmlinuz-2.6.32/ s/$/ intremap=off/' /boot/grub/grub.conf
```

> 上述方法简单来说就是先匹配，然后搜索到最后的标志`$`，再进行替换。

参考 

[How to append a string at end of a specific line in a file in bash](http://stackoverflow.com/questions/22159044/how-to-append-a-string-at-end-of-a-specific-line-in-a-file-in-bash)

[Add to the end of a line containing a pattern - with sed or awk](http://stackoverflow.com/questions/9591744/add-to-the-end-of-a-line-containing-a-pattern-with-sed-or-awk)

* 将换行符`\n`替换成字符

例如，我有一个文件包含了多个主机名（每行是一个主机名），但是提交到某个平台的时候，格式要求使用`,`分隔，则可以通过sed来替换换行符`\n`

```
sed ':a;N;$!ba;s/\n/,/g' file
```

含义如下：

* 创建一个标签（liabel） `:a`
* 通过添加`N`到当前和下一行的位置
* 如果在最后一行之前，则创建标签`$!ba`（`$!`表示如果最后一行就不做）
* 最后将所有换行符替换成`,`

上述命令是使用GNU sed，如果是跨平台，则使用BSD `sed`

```
sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/,/g'
```

参考 [How can I replace a newline (\n) using sed?](http://stackoverflow.com/questions/1251999/how-can-i-replace-a-newline-n-using-sed)

> 更为简单的方法是使用`tr`，不过结尾多一个`,`

```
tr '\n' ',' < input_filename
```

怎样去除最后一个字符，应该可以使用`sed`或`awk`，不过 [Delete the last character of a string using string manipulation in shell script](http://unix.stackexchange.com/questions/144298/delete-the-last-character-of-a-string-using-string-manipulation-in-shell-script) 提供了一个巧妙的方法，组合利用`rev`命令和`cut`命令。即先将字符串倒转（`rev`），然后用`cut -c 2-`截取出`(n+1)-`之后所有字符，然后再倒转回来

```
cat input_filename | tr '\n' ',' | rev | cut -c 2- | rev
```

还有一种方法是使用bash 4.2之后，支持字符串变量切片

```
a=`cat input_filename | tr '\n' ','`
echo "${a::-1}"
```

# 匹配行修改

例如我需要修改 `/etc/fstab` ，将包含 `swap` 行注释掉。参考 [sed - Commenting a line matching a specific string AND that is not already commented out](https://stackoverflow.com/questions/17998763/sed-commenting-a-line-matching-a-specific-string-and-that-is-not-already-comme)

原先的 `/etc/fstab` 内容如下：

```
...
UUID=57e88efb-83f7-42a3-8080-f943626bd7f7 swap                    swap    defaults        0 0
```

修改命令如下：

```
sed -i -e '/swap/s/^UUID=/#UUID=/g' /etc/fstab
```

上述表示先匹配swap行，然后搜索 `UUID=` 开头的内容替换成 `#UUID=`

# 占位符替换思路

当需要向海量服务器部署配置脚本，但是配置脚本中某些字符串和服务器主机名相关（需要改成主机名），则可以模仿`puppet`之类的配置管理工具，采用配置文件中占位符方式来实现。

即预先分发的配置文件中包含一些特定的预先占好位置的变量字符串（具有特征，如全大写，或者有特殊符号），在分发完成后，采用pssh命令对配置文件中占位符变量进行替换。

举例：配置文件 `/etc/example.conf` 内容如下：

```bash
...
console name='HOSTNAME' dev='/dev/null' opts='-o example'
```

> `HOSTNAME`就是需要替换的占位符变量

通过`pscp`分发完配置文件到所有服务器之后，就可以通过以下`pssh`命令将每个主机的主机名提取出来，然后用实际主机名替换`HOSTNAME`：

```
pssh -ih server_list "HOST=\$(hostname);sudo sed -i \"s/HOSTNAME/\$HOST/\" /etc/example.conf"
```

# sed多个匹配

sed支持一次检查多个匹配，实际上就是sed多个指令的意思。注意：指令之间使用`;`分隔：

```
sed -i '/PATTERN_1/d;PATTERN_2/d;PATTERN_3/d;/^$/d' myfile.txt
```

# sed转换文档实现unix2dos

* unix2dos

```
sed 's/$'"/`echo \\\r`/" disk.txt > disk_dos.txt
```

* dos2unix

```
sed 's/^M$//' disk_dos.txt > disk.txt
```

> 参考 [HowTo: UNIX / Linux Convert DOS Newlines CR-LF to Unix/Linux Format](https://www.cyberciti.biz/faq/howto-unix-linux-convert-dos-newlines-cr-lf-unix-text-format/)

# 参考

* [sed - 25 examples to delete a line or pattern in a file](http://unix-school.blogspot.com/2012/06/sed-25-examples-to-delete-line-or.html)
* [linux cut help - how to specify more spaces for the delimiter?](http://stackoverflow.com/questions/7142735/linux-cut-help-how-to-specify-more-spaces-for-the-delimiter)
* [How can I replace a newline (\n) using sed?](http://stackoverflow.com/questions/1251999/how-can-i-replace-a-newline-n-using-sed)
* [Delete last line from the file](https://unix.stackexchange.com/questions/52779/delete-last-line-from-the-file)