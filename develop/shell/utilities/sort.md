# 多列文本按照指定列排序

例如有文本格式

```
FirstName, FamilyName, Address, PhoneNumber
```

需要按照`FamilyName`排序。

`sort`工具提供了`-k`参数按照某列或多列排序。例如首先按照`FamilyName`排序然后按照`FirstName`排序：

```bash
sort -k 2,2 -k 1,1 file.txt
```

* `-k, --key=POS1[,POS2]`:

从`POS1`开始排序key，终止于`POS2`key。

POS是`F[.C][OPTS]`，`F`是字段编号，`C`是该字段的字符位置。

* `-t, --field-separator=SEP`

设置 `SEP` 替代默认的空白分隔符

# 按照数值排序

sort默认是按照ASCII码排序，如果要按照数值排序，则使用参数 `-n`

# 参考

* [Linux shell sort file according to the second column?](https://stackoverflow.com/questions/4262650/linux-shell-sort-file-according-to-the-second-column)