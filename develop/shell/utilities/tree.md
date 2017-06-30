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

# Mac上等同`tree`命令

Mac OS X上没有`tree`工具，可以下载[tree源代码](http://mama.indstate.edu/users/ice/tree/)编译，但是，如果只是为了简单递归展示整个目录树的文件，则可以使用`find`指令：

```
find .
```

> 在我的`cloud-atlas-draft`目录下列出所有文本文件，用于整理`summory.md`文档

```
find . | grep -v ".git" | grep -v "_book" | grep -v "\/img\/"
```

将显示所有子目录和文件。

也可以使用如下脚本

```
alias tree="find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'"
```

# 参考

* [Linux command to print directory structure in the form of a tree](https://stackoverflow.com/questions/3455625/linux-command-to-print-directory-structure-in-the-form-of-a-tree)
* [Mac OS X equivalent of the Ubuntu “tree” command](https://superuser.com/questions/359723/mac-os-x-equivalent-of-the-ubuntu-tree-command)
* [Using a Mac Equivalent of Unix “tree” Command to View Folder Trees at Terminal](http://osxdaily.com/2016/09/09/view-folder-tree-terminal-mac-os-tree-equivalent/)