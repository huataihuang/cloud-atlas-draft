# 累加某列

```
ls -l php* | awk '{ SUM += $5} END { print SUM/1024/1024 }'
```

> 参考 [Sum using awk](http://www.liamdelahunty.com/tips/linux_ls_awk_totals.php)

# 字符串大小写转换

* 字符转为大写

```
cat file.txt | awk '{print toupper($0)}'
```

* 字符转为小写

```
cat file.txt | awk '{print tolower($0)}'
```

# 用`-F`指定过个分隔符及正则表达式

> 参考 [用-F指定多分隔符及正则表达式](https://blog.csdn.net/computer055maxi/article/details/6317251)

* `-F"[@ /t]"` 告诉awk `@`, `空格`和`Tab`都是字段分隔符

```bash
awk -F"[@ /t]" '{print $2,$3}' test
```

* 第二个字段以"123"或"yahoo"开始，则输出改行的第二、第三列

```bash
awk '$2~/^(126|yahoo)/{print $2, $3}' test
```

* 最后两个字段以数字结束，则输出改行的第一、第三列

```bash
awk '$1~/[0-9][0-9]$/{print $1, $3}' test
```

* 输出test文件中含有"mail"字符串的行

```bash
awk '$2~/mail/{print $0}' test
```

* 输出test文件中第二个字段含有"mail"字符串的行

```bash
awk '$2~/mail/{print $0}' test
```

* 输出test文件中第二个字段是"gmail.com"的行，并把改行第一列改为"ggg"

```bash
awk '$2 == "gmail.com"{$1 = "ggg";print}' test
```

* 输出test文件中所有行，并且如果第二个字段是"gmail.com"，把改行第一列改为"ggg"

```bash
awk '$2 == "gmail.com"{$1 = "ggg"}{print}' test
```

* 打开test文件，忽略字母大小写，如果第二字段以[a-z]开头，并以"net"结尾，则输出该行

```bash
awk '{IGNORECASE=1;if($2 ~/^[a-z]/&& $2~/net$/){print $0}}' test
```