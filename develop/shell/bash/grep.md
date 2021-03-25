常用的字符过滤命令`grep`实际上有很多使用技巧，这里搜集一些案例。

# 只显示匹配的第一行数据

通常`grep`过滤会显示所有匹配行，虽然也可以将匹配后的多行再使用`head -1`过滤一次得到第一个匹配行，但是，实际上`grep`提供了一个参数`-m`或`--max`来显示最大显示多少行，也就能够得到最先匹配的行了：

```bash
grep -m 1 "pattern" filename.txt
```

# 匹配内容输出时同时显示行号

`grep`提供了同时输出匹配行的行号功能，命令行参数是`-n`，此时输出时会显示`行号:匹配行内容`:

```bash
grep -n "pattern" filename.txt
```

输出类似

```
5:line_x xxxxxx
6:line_y yyyyyy
```

# 忽略二进制文件和跳过不需要检查的目录

`-I`参数可以忽略二进制文件的过滤（因为我们需要过滤的是代码文本），`-r`可以递归检查所有子目录，`--exclude-dir`可以跳过不需要检查的目录。举例如下：

```
grep -rI --exclude-dir="_book" "centos5" *
```

# grep结合OR, AND, NOT

在做grep的时候，实际上有很多条件是 `或` `与` `非` ，虽然也能够使用管道来结合多个grep完成，但是实在太不优雅了。grep已经提供了 `OR` 和 `NOT` 操作，虽然没有直接提供 `AND` 操作，但是可以模拟。

## grep或操作

* 使用 `\|` 作为或操作

```bash
grep 'pattern1\|pattern2' filename
```

* grep也提供了一个 `-E` 参数启用扩容的regexp，当使用 `-E` 参数时候，就可以使用 `|` 作为多个匹配的分隔符号:

```bash
grep -E 'pattern1|pattern2' filename
```

* 此外，`egrep` 命令提供了和 `grep -E` 相同的功能:

```bash
egrep 'pattern1|pattern2' filename
```

* 而 `grep` 命令提供了参数 `-e` 可以用来传递多个匹配关键字：

```bash
grep -e pattern1 -e pattern2 filename
```

## grep与操作

* 虽然没有直接的AND操作福，但是可以使用 `grep -E` 来模拟AND

```bash
grep -E 'pattern1.*pattern2' filename
```

> 实际上就是占位符生效

* 当然比较简单明了的还是串行使用多个grep

```
grep -E 'pattern1' filename | grep -E 'pattern2'
```

## grep NOT就是 `grep -v`

`grep -v` 就表示非操作，也就是反匹配：

```
grep -v 'pattern1' filename
```

我们在使用 `grep` 命令过滤进程的时候通常就使用 `-v` 参数来过滤掉 `grep` 命令自身：

```
ps aux | grep sshd | grep -v grep
```

这样输出内容就不会包含 `grep sshd` 这个命令。不过，实际上 `grep` 命令还有一个小技巧，就是直接使用:

```
ps aux | grep [s]shd
```

上述表达式是的 `grep` 只会匹配 `sshd` 而不会匹配 `[s]shd` (后者是grep命令自己使用不显示在进程列表中)

# pgrep

如果要找到一个进程名对应的进程PID，我以前是结合使用 `awk` 命令:

```
ps aux | grep [s]shd | awk '{print $1}'
```

实际上，系统还提供了一个 `pgrep` 命令方便过滤进程pid：

```
pgrep sshd
```

就可以找到系统中所有 `sshd` 对应的pid

* 通过 `pgrep` 命令还可以获得完整的进程命令 `-a` :

```
pgrep -a sshd
```

* 使用 `-l` 参数可以同时获得 PID 和进程名

```
pgrep -l firefox
```

# 参考

* [GREP如何提取文件中第一个相关匹配](http://bbs.chinaunix.net/thread-3590779-1-1.html)
* [grep 能否给出搜到行的行号＋内容？](http://bbs.chinaunix.net/thread-286265-1-1.html)
* [7 Linux Grep OR, Grep AND, Grep NOT Operator Examples](https://www.thegeekstuff.com/2011/10/grep-or-and-not-operators/)
* [Remove grep command while grepping using ps command](https://www.cyberciti.biz/tips/grepping-ps-output-without-getting-grep.html)
