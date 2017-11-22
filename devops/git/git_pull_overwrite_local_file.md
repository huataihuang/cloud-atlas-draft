> 这种情况比较少见，保险起见还是另外开一个新的目录从远程重新clone一份文档比较好。

有时候本地文件被搞错了，希望从远程重新同步一份代码覆盖本地文件，此时可以使用如下命令：

```
git fetch --all
```

然后有两个选项：

* 从主干同步覆盖本地文件

```
git reset --hard origin/master
```

* 从远程某个分支同步覆盖本地文件

```
git reset --hard origin/<branch_name>
```

> **`警告`**
>
> 所有本地修改的文件都会被清除

# 参考

* [How do I force “git pull” to overwrite local files?](https://stackoverflow.com/questions/1125968/how-do-i-force-git-pull-to-overwrite-local-files)