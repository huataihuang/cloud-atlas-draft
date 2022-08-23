删除文件的最后一行，最简单的方法是使用 `sed` ，因为 `sed` 提供了 `$` 代表最后一行，所以删除最后一行就是使用:

```bash
sed -i '$ d' foo.txt
```

另外一种方式使用 `head` 命令，因为 `head` 命令提供了 `-n -1` 表示输出倒数第一行之前内容(这个命令也提供了删除倒数X行的思路):

```bash
head -n -1 foo.txt > bar.txt
```

对于非常巨大的文件(~300Gb)，也有人提出了一个思路，就是定位最后一行的文件位置，然后通过 `dd` 命令抹除掉(记录备用):

```bash
filename="example.txt"

file_size="$(stat --format=%s "$filename")"
trim_count="$(tail -n1 "$filename" | wc -c)"
end_position="$(echo "$file_size - $trim_count" | bc)"

dd if=/dev/null of="$filename" bs=1 seek="$end_position"
```

上述脚本也可以用一行替代

```bash
dd if=/dev/null of=<filename> bs=1 seek=$(echo $(stat --format=%s <filename> ) - $( tail -n1 <filename> | wc -c) | bc )
```

> 上述操作务必小心，建议先备份文件

# 参考

* [Remove the last line from a file in Bash](https://stackoverflow.com/questions/4881930/remove-the-last-line-from-a-file-in-bash)