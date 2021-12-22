很多时候需要压缩一行文本中不断变化的空白符号，将多个空白改成一个空白，或者替换成分隔逗号 `,`

举例:

```bash
"too         many       spaces."
```

替换成

```bash
"too many spaces."
```

解决方法是使用 `tr -s` 命令：

```
-s, --squeeze-repeats
       replace each sequence of a repeated character that is listed  in
       the last specified SET, with a single occurrence of that charac‐
       ter
```

在我的实践案例中，我需要把文本中的多个 `TAB` 替换成一个 `,` ，以便输出 `.csv` 文件，也采用上述方法

# 参考

* [How to replace multiple spaces with a single space using Bash?](https://stackoverflow.com/questions/50259869/how-to-replace-multiple-spaces-with-a-single-space-using-bash)