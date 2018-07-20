# find查找时忽略某些目录

当使用`find .`查找当前目录中某个文件时，有时候需要忽略或跳过某些子目录。`find`指令提供了一个`-not -path "./directory/*"` 的方法来忽略当前目录下的子目录`./directory/`及其递归子目录。

例如

```bash
find -name "*.js" -not -path "./directory/*"
```

> 参考 [Exclude directory from find . command](https://stackoverflow.com/questions/4210042/exclude-directory-from-find-command)

# find查找多个目录中文件

`find`命令如传递多个目录，可以同时查找：

```bash
find /dir1/ /dir2/ -type f -cmin -5 | grep 'STRINGS'
```

注意，如果多多个目录查询，如果恰好有某个目录不存在，则会提示目录不存在信息：

```
find: /dir2/: No such file or directory 
```

这在后续脚本处理中非常难看。解决的方法是将标准错误重定向：添加`2>/dev/null`，就可以忽略掉错误信息

```bash
find /dir1/ /dir2/ -type f -cmin -5 2>/dev/null | grep 'STRINGS'
```

> 参考 [Supresss the 'no such file or directory' message from 'find'](https://superuser.com/questions/393812/supresss-the-no-such-file-or-directory-message-from-find)

此外，类似`grep`命令，you一个参数`-s`也可以忽略这样的错误信息。 [How to configure 'grep' to ignore 'No such file or directory](https://www.linuxquestions.org/questions/linux-newbie-8/how-to-configure-%27grep%27-to-ignore-%27no-such-file-or-directory-738447/)