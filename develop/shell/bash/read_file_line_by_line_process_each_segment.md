# 问题

经常需要处理多列的文本文件，需要一行行读取，然后处理每个字段内容。例如文本`data.txt`内容如下

```
server1.example.com     file_name_1
server2.example.com     file_name_2
server3.example.com     file_name_3
```

在bash,ksh,zsh以及各种shell中，都可以使用 while + read 循环来完成文件按行读取：

```bash
while read -r line; do COMMAND; done < input.file
```

参数 `-r` 是为了避免反斜扛`\`命令执行。

此外，`read` 还支持一个 `IFS=` 选项来指定分隔符号，例如使用`,` 的csv文件，就可以使用 `IFS=,` 来指定分隔符号::

```bash
#!/bin/bash
input="/path/to/txt/file"
while IFS= read -r line
do
  echo "$line"
done < "$input"
```

另外，参考 [Linux bash: Multiple variable assignment](https://stackoverflow.com/questions/1952404/linux-bash-multiple-variable-assignment) 有一个类似变量读取案例:

```bash
read -r a b c <<<$(echo 1 2 3) ; echo "$a|$b|$c"
```

# 方法一

需要将每行数据读入变量 `$nc` 和 `$file` 然后进行处理

在bash中有一个非常简单的通过while循环将每行数据的列值赋予变量的方法：

```bash
while read nc file;do
    echo $nc
    echo $file
    ....
done < "data.txt"
```

# 方法二

```bash
#!/bin/bash
input="/path/to/txt/file"
while IFS= read -r line
do
  echo "$line"
done < "$input"
```

`$input` 是你读取的文件名。一行行读取文件，并赋值给 `$line` 变量。内部 `字段分隔符` `IFS` 被设置成空白字符串以避免空白问题。这是一个fail-safe功能。

此外可以从其他命令输出读取（这种方式特别适合检查进程，并从进程中区分出字段进行处理）：

```bash
while IFS= read -r line
do
   ## take some action on $line
  echo "$line"
done < < (command)
 
while IFS= read -r line
do
   ## take some action on $line
  echo "$line"
done < <(ps aux)
```

# 使用here字符串

```bash
while IFS= read -r line
do
  # take action on $line #
  echo "$line"
done <<< $(command)
```


```bash
while IFS= read -r line
do
  echo "$line"
done <<< $(ps aux)
```


```bash
t="10"
I="/home/vivek/.data/tags.deleted.410"
url=""
while IFS= read -r line
do
        url="$url $line"
done <<<"$(tail -${t} ${I})"
[ "$url" != "" ] && ~/bin/cloudflare.purge.urls.sh "$url"
```

# 读取指定行数

可以读取指定N行：

```bash
input="/path/to/file"
while IFS= read -r -uN line
do
  # do something on $line
  echo "$line"
done N< $input
```

举例：

```bash
while IFS= read -r -u13 line
do 
   echo "$line"
done 13<"${input}"
```

# 按照字段读取

```bash
#!/bin/bash
file="/etc/passwd"
while IFS=: read -r f1 f2 f3 f4 f5 f6 f7
do
        # display fields using f1, f2,..,f7
        printf 'Username: %s, Shell: %s, Home Dir: %s\n' "$f1" "$f7" "$f6"
done <"$file"
```

# 问题

这里我遇到一次编程错误： `$META_PHY` 文件包含了主机序列号和IP地址，需要

```bash
    while read phy_sn phy_ip;do
        logger "phy_sn: $phy_sn"
        logger "phy_ip: $phy_ip"
        phy_outwarranty=$( get_phy_outwarranty $phy_sn )
        phy_sm=$( get_phy_sm $phy_ip )
        phy_info="$phy_sn,$phy_ip,$phy_sm,$phy_outwarranty"
        echo $phy_info >> $META_PHY_INFO
    done < $META_PHY
```

这里遇到一个问题，从 `$META_PHY` 文件中读取的每一行有2个参数，分别赋予 `phy_sn` 和 `phy_ip` ，但是发现是一次就读取完所有行，并调用 `get_phy_outwarranty` 和 `get_phy_sm` 函数之后连续循环，导致 `phy_outwarranty` 变量值是4行记录合并在一起。

这里 `get_phy_outwarranty` 是通过调用工具命令返回的结果，而正常的function是采用ssh到服务器上获取的数据(正常)。

# 参考

* [Bash: read a file line-by-line and process each segment as parameters to other prog](https://stackoverflow.com/questions/7619438/bash-read-a-file-line-by-line-and-process-each-segment-as-parameters-to-other-p)
* [Syntax: Read file line by line on a Bash Unix & Linux shell: ](https://www.cyberciti.biz/faq/unix-howto-read-line-by-line-from-file/)
