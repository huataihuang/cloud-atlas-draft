当本地修改了文件，同时发现远程仓库中有其他人对同一个文件进行了修改并提交，此时尝试提交本地文件时会提示：

```
error: Your local changes to the following files would be overwritten by merge:
...
```

* 如果需要放弃本地修改的内容，可以隐藏（stash），即:

```
git stash save --keep-index
```

如果真的不需要这些修改，则可以drop掉隐藏内容：

```
git stash drop
```

* 如果只需要部分本地修改的内容，可以先提交需要保留的commit，然后再使用上述命令。最后在使用`git checkout path/to/file/to/revert`来更改想要覆盖的。注意文件不要通过`git reset HEAD path/to/file/to/revert`标记过。

# 参考

* [How to ignore error on git pull about my local changes would be overwritten by merge?](https://stackoverflow.com/questions/14318234/how-to-ignore-error-on-git-pull-about-my-local-changes-would-be-overwritten-by-m)