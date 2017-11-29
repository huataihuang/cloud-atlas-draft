> 设置git忽略文件mode修改的方法很少使用，我是在一次[远程sshfs挂载CentOS 5.7服务器的文件系统目录，遇到fatal: could not set 'core.filemode' to 'true'报错](../../service/ssh/sshfs)才google了这个方法。不过，关闭git的`core.fileMode`不是一个好的方法，可能会有安全隐患（可执行文件属性被直接带到git仓库中）。

如果在git的代码库中，有一些shell脚本，希望保留可执行属性（例如`755`）提交到git仓库，可以采用将git的 `core.fileMode` 设置成 `false` 来忽略索引和工作副本的执行位属性。通常用于非常古老的文件系统，例如FAT。

```
git config core.fileMode false
```

参考 [git-config(1)](https://www.kernel.org/pub/software/scm/git/docs/git-config.html)

```
core.fileMode
       If false, the executable bit differences between the index and the
       working copy are ignored; useful on broken filesystems like FAT.
       See git-update-index(1). True by default.
```

如果一次性设置，则使用`-c`参数

```
git -c core.fileMode=false diff
```

而`--global`参数则设置用户的全局默认设置

```
git config --global core.fileMode false
```

**`警告`**

`core.fileMode`不是一个推荐方法，并且需要非常谨慎使用。这个设置只覆盖执行位而不是读写未。大多数情况下，类似`chmod -R 777`设置文件执行属性。但是多数项目**多数文件由于安全原因不需要设置文件的执行属性**。

如果可以，还是不要在git中设置文件执行属性，而是在实际使用文件时再单独给文件设置，例如：

```
find . -type d -exec chmod a+rwx {} \; # Make folders traversable and read/write
find . -type f -exec chmod a+rw {} \;  # Make files read/write
```

这样就永远不需要使用 `core.fileMode` 这个特殊设置，即使非常特殊的情况下。

# 参考

* [How do I make Git ignore file mode (chmod) changes?](https://stackoverflow.com/questions/1580596/how-do-i-make-git-ignore-file-mode-chmod-changes)