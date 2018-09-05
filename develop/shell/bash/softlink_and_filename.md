shell脚本中获取软链接的方法是 `readlink`

```bash
path="/usr/lib/libxslt.so.1"
readlink -f "$path"
```

则输出为完整的文件路径

```
/usr/lib/libxslt.so.1.1.17
```

如果我们的脚本需要在滤掉目录，只保留文件名，则使用`basename`（对软连接也可使用）

```bash
basename "$path"
```

输出结果就是

```
libxslt.so.1
```

# 参考

* [How to resolve symbolic links in a shell script](https://stackoverflow.com/questions/7665/how-to-resolve-symbolic-links-in-a-shell-script)