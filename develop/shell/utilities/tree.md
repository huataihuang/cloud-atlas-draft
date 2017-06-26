这是一个非常简单而又形象化的工具据，可以用来树状展示文件系统目录，所以工具的名字就叫`tree`。

* 没有任何参数直接使用`tree`则展示目录下所有子目录和文件

```
tree /proc/self/
```

* `-d`参数则只展示目录

```
tree -d /proc/self/
```

* `-L`参数可以指定最大递归层数

```
tree -L 2 -d /proc/self/
```

* `-F`参数可以在目录和文件上添加一些有用的标识

```
-F     Append a `/' for directories, a `=' for socket files, a `*' for executable files, a `>' for doors (Solaris) and a `|'
              for FIFO's, as per ls -F
```

# 参考

* [Linux command to print directory structure in the form of a tree](https://stackoverflow.com/questions/3455625/linux-command-to-print-directory-structure-in-the-form-of-a-tree)