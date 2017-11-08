# find查找时忽略某些目录

当使用`find .`查找当前目录中某个文件时，有时候需要忽略或跳过某些子目录。`find`指令提供了一个`-not -path "./directory/*"` 的方法来忽略当前目录下的子目录`./directory/`及其递归子目录。

例如

```bash
find -name "*.js" -not -path "./directory/*"
```

> 参考 [Exclude directory from find . command](https://stackoverflow.com/questions/4210042/exclude-directory-from-find-command)