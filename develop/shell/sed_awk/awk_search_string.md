# 搜索匹配

通常在过滤匹配字符串的时候，我们会使用`grep`命令，而挑选打印出匹配行的某列，又会去结合`awk`，例如筛选出以下xml中的IP地址，如果采用`grep`命令过滤出ip行再传递给`awk`处理就非常raw了，特别是需要多次过滤。

```xml
<?xml version="1.0" encoding="utf-8"?>
<rsp>
  <code>200</code>
  <msg>successful</msg>
  <data>
    <ips list="true">
      <item>
        <ip>192.168.1.9</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
      <item>
        <ip>192.168.1.101</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
      <item>
        <ip>192.168.1.193</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
      <item>
        <ip>192.168.1.2</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
    </ips>
  </data>
</rsp>
```

`awk`其实支持几乎所有的`grep`功能，其搜索字符串非常高效，以下是处理方法：

```bash
awk -F "[<>]" '/ip/ && /[0-9]./ {print $3}' ip.xml
```

说明：

* `/XXXX/` 表示搜索`XXXX`字符串
* `&&` 符号表示同时满足两个搜索条件，即字符串中既包含"ip"又包含"数字+."；如果要表示`或`逻辑，就使用`||`
* 支持正则表达`[]`

# 输出大于某值的行

案例文件内容

```bash
Medicine,200
Grocery,500
Rent,900
Grocery,800
Medicine,600
```

输出大于`500`的行

```bash
awk -F, '$2>500' file
```

输出大于`500`且包含`Medicine`的行

```bash
awk -F, '/Medicine/ && $2>500' file
```

输出包含`Medicine`或值大于`600`的行

```bash
awk -F, '/Medicine/ || $2>600' file
```

# 忽略大小写

类似`grep -i linux file`可以匹配`Linux`和`lINux`这样的字符串，`awk`也提供内建的变量表达：

```bash
awk '/linux/' IGNORECASE=1 file
```

# 计算包含'Unix'字符串的行数量

类似`grep -c Unix file`，`awk`提供如下计算方法

```bash
awk '/Unix/{x++;}END(print x)' file
```

这里变量就是"Unix"字符串匹配时候自增量的变量，最后`END`时候输出变量`x`就计算出匹配"Unix"的次数。

# 列出所有包含'AIX'的文件名

类似`grep -l AIX file*`（这里`grep`的`-l`不打印匹配字符串，而只是打印包含匹配字符串的文件名），对应`awk`提供了如下解决方法：

```bash
awk '/AIX/{print FILENAME;nextfile}' file*
```

`awk`有一个特殊的变量`FILNAME`包含当前工作的文件的文件名。所以，当匹配时候打印这个变量就是列出了匹配字符串的文件的文件名。`nextfile`是`awk`的命令表示退出当前文件并开始在新文件上工作。如果不使用`nextfile`命令，如果这个匹配字符串在文件中出现2次，则文件名会被打印2次。

# 打印出匹配字符串的行号

`grep`命令有一个参数`-n`可以打印出匹配的字符串的行号，例如：

```bash
grep -n Unix file
```

输出显示

```
1:Unix
7:Unix
```

对应`awk`可以使用内建的`NR`变量来输出行号：

```bash
awk '/Unix/{print NR":"$0}' file
```

# 搜索文件中的包含'Linux'和'Solaris'


使用`grep`的参数`-E`可以启用正则表达式匹配，例如：

```bash
grep -E 'Linux|Solaris' file
```

可以匹配输出如下

```
Linux
Solaris
```

对应`awk`是直接支持正则表达式，无需任何参数：

```bash
awk '/Linux|Solaris/' file
```

# 反向匹配搜索字符串'Linux'

如果要输出所有**不**包含`Linux`字符串的行

```bash
greo -v Linux file
```

这里`grep`命令的`-v`参数表示`inverse`

对应`awk`命令可以使用`!`表示取反

```bash
awk '!/Linux/' file
```

# 打印匹配行之后的行

`grep`命令的参数`-A1`表示匹配行和之后（`After`）1行

```bash
grep -A1 Linux file
```

输出是

```
Linux
Solaris
```

在`awk`中，提供了`getline`命令表示从缓存中获取下一行并保存在变量`$0`中，所以这里在`getline`命令之后再`print`就会打印出下一行。当然，在`getline`命令之前的`print`就是打印匹配行

```bash
awk '/Linux/{print;getline;print}' file
```

# 打印匹配行之前的一行

`grep`命令的参数`-B1`表示匹配行和之前（`Before`)1行

```bash
grep -B1 Solaris file
```

输出是

```
Linux
Solaris
```

对应在`awk`中，有一个变量`x`，当匹配上字符串的时候，这个变量`x`中存储的是上一行，所以，当打印这个`x`之后，再使用`next`指令将指针移动到下一行，此时把`$0`也就是匹配行复制给`x`再打印一次，就会打印出当前匹配行：

```bash
awk '/Solaris/{print x;print;next}{x=$0;}' file
```

# 打印匹配行以及之前1行和之后1行

`grep`的`-C1`参数可以打印匹配行前后行：

```bash
grep -C1 Solaris file
```

输出是

```
Linux
Solaris
AIX
```

对应`awk`命令则结合前面两个案例如下：

```bash
awk '/Solaris/{print x;print;getline;print;next}{x=$0}' file
```

# 计算合计

```
awk '{s+=$1} END {print s}' mydatafile
```

# 参考

* [awk - Match a pattern in a file in Linux](http://www.tuicool.com/articles/F7JbEn)
* [grep vs awk : 10 examples of pattern search](http://www.theunixschool.com/2012/09/grep-vs-awk-examples-for-pattern-search.html)
* [Shell command to sum integers, one per line?](http://stackoverflow.com/questions/450799/shell-command-to-sum-integers-one-per-line)