在目录下存在大量文件时，如果采用通配符进行删除

```bash
rm -f core.*
```

常常会遇到以下报错：

```bash
bash: /bin/rm: Argument list too long
```

这个报错是因为通配符匹配了太多的文件，导致删除命令的参数过多，超出了操作系统的 `ARG_MAX` 限制。例如，对于内核 `2.6.23` 限制设置了 `128KB`，你可以通过以下命令获得操作系统限制:

```bash
getconf ARG_MAX
```

输出通常是

```
2097152
```

要解决删除问题，可以结合 find 命令

```bash
find . -name "core.*" -delete
```

或者结合 xargs 处理

```
find . -name "core.*" -print0 | xargs -0 rm
```

如果希望查找命令不递归执行，只限于当前目录，则加上 `maxdepth` 参数

```
find . -maxdepth 1 -name "core.*" -print0 | xargs -0 rm
```

也可以使用循环命令

```bash
for f in "core.*"; do rm "$f"; done
```

# 参考

* [Argument list too long error for rm, cp, mv commands](https://stackoverflow.com/questions/11289551/argument-list-too-long-error-for-rm-cp-mv-commands)