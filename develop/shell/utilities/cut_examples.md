# 简单的`cut`举例

`cut`最简单的使用方法是结合`-d`和`-f`

```bash
cut -d':' -f1 /etc/passwd
```

则可以截取出用户帐号

如果要截取多个字段，则可以类似使用如下案例

```bash
grep "/bin/bash" /etc/passwd | cut -d':' -f1,6
```

# 获取字符串部分字符

```bash
command | cut -c1-8
```

切出命令输出的前8个字符

> [Grabbing the first [x] characters for a string from a pipe](https://unix.stackexchange.com/questions/3454/grabbing-the-first-x-characters-for-a-string-from-a-pipe)

另外也有一些方法只获得前8个字符：

```bash
command | head -c8

command | awk '{print substr($0,1,8);exit}' 

command | sed 's/^\(........\).*/\1/;q'
```

如果是bash，还可以：

```bash
var=$(command)
echo ${var:0:8}
```

# 分隔(delimiter)符使用`tab`的`cut`方法

如果字段之间是使用TAB来分隔的，有以下两种方法使用`cut`

* 按下`Ctrl-v + Tab`

```bash
cut -f2 -d'   ' infile
```

* 或者

```bash
cut -f2 -d$'\t' infile
```

**BUT，其实`cut`默认的分隔符就是`TAB`，也就是不需要使用`-d`也可以啦！**

# 多个（任意数量）空格的分隔使用`cut`方法

* 使用`sed`来合并多个空格成一个空格

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

* 使用`tr -s ' '`来合并多个空格成为一个空格（这个方法最简单）

```bash
ps axu | grep '[j]boss' | tr -s ' ' | cut -d' ' -f2
```

> `tr`命令`-s`表示**压缩重复**的意思（squeeze repeats），可以将多个重复字符压缩成单个字符，非常有用！

# 参考

* [How to cut by tab character](http://unix.stackexchange.com/questions/35369/how-to-cut-by-tab-character)
* []