groovy可以使用 `|` 来表示 `或` ，在字符串分隔时可以使用

```groovy
String[]tokens = pdfName.split("-|\\.");
```

可以将 `AA.BB-CC-DD.zip` 切分成

```
AA
BB
CC
DD
zip
```

# 参考

* [Use String.split() with multiple delimiters](https://stackoverflow.com/questions/5993779/use-string-split-with-multiple-delimiters)