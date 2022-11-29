假设我们需要处理一个文本文件

```
1223 1234 1323 ... 2222 123
1233 1234 1233 ... 3444 125
0000 5553 3455 ... 2334 222
```

将最后一列去除

# 使用ask的NF

可以使用以下3种awk方法:

```bash
awk 'NF{NF-=1};1' <in >out
```

```bash
awk 'NF{NF--};1' <in >out
```

```bash
awk 'NF{--NF};1' <in >out
```

解释:

* `NF` 表示一行中字段数的变量。 在 AWK 中，如果它们不是 0 或空字符串“”，则为真。
* `NF-=1` `NF--` 或 `--NF` 只是从 NF 变量中减去 1，这样可以防止最后一个字段被打印出来。awk 重新构造 $0，默认情况下连接所有由空格分隔的字段。 $0 不再包含最后一个字段。
* 最后一部分是1，用作表示真实的表达式。 如果 awk 表达式在没有任何关联操作的情况下求值为真，则 awk 的默认操作是打印 $0。

# 更好的思路:将指定列=""

另一种思路是把指定列填写为 "" ，也就是清除，例如

```bash
awk '{$6=$8=""; print $0}' file
```

则不会打印第6和第8列

所以我们也可以用这个方法来抹去最后一列

```bash
awk '{$(NF)=""; print $0}' file
```

# 参考

* [How to delete the last column of a file in Linux](https://unix.stackexchange.com/questions/234432/how-to-delete-the-last-column-of-a-file-in-linux)