> 本文记录也可能是我误操作，或者是某些未知的原因导致数据损坏，但是，在 `git pull` 和 Dropbox 都提示目录文件已经更新最新情况下，依然看到git仓库中软链接目录指向的实际目录中文件不一致，让我非常困惑。
>
> 我推测是git同步元数据在dropbox中损坏，也可能是两个电脑之间同步文件存在问题。
>
> 总之，既然git能够保证我的程序代码库同步一致，就不再叠加Dropbox或者其他云存储来同步文件。Dropbox和iCloud的云存储都不允许目录重叠，应该是在同步机制存在隐含的冲突。

注意：这里操作系统是Mac OS X 11.12.5

以下是git仓库在Dropbox中文件和文件目录在`ls -lh`下展示，原先的软链接和文件目录属性后都增加了一个 `@` 符号

```
$ ls -lh
total 6264
-rw-r--r--@ 1 huatai  staff   1.6K Apr 11 18:00 README
drwxr-xr-x@ 5 huatai  staff   170B Jun 26 15:35 current
...
```

作为对比，重新从git远程仓库同步文件，正确的文件`ls -lh`显示如下

```
$ ls -lh
total 6272
-rw-r--r--  1 huatai  staff   1.6K Jun 26 15:49 README
lrwxr-xr-x  1 huatai  staff    16B Jun 26 15:49 current -> projects/v803-7u
...
```

在Mac操作系统Finder文件管理器中，存在异常的软链接已经不再显示软链接图标，而是直接显示为目录图标。

在 [How do I keep GIT repositories inside Dropbox?](https://stackoverflow.com/questions/29983646/how-do-i-keep-git-repositories-inside-dropbox) 中提到了2个软件仓库损坏的案例

*https://stackoverflow.com/a/9030201/1860929
* https://stackoverflow.com/a/5044399/1860929
