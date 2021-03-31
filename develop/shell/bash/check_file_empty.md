我们知道在脚本中用 `-z` 可以判断字符串是否为空，那么对于文件来说，该怎么判断是否为空呢？

bash也提供了一个 `-s` 来判断文件是否为空，注意，当文件中 **有内容** 时候为 **真**

```bash
[ -s file.name ] || echo "file is empty"
```

# 参考

* [How to check if a file is empty in Bash?](https://stackoverflow.com/questions/9964823/how-to-check-if-a-file-is-empty-in-bash)