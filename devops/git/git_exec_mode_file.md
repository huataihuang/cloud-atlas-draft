在Git中提交的文件，默认都没有执行属性，所以一般shell脚本或者执行程序 `git clone` 到本地之后，还需要使用 `chmod +x <filename>` 来添加执行属性。

实际上git也支持给文件增加执行属性，这样 `git clone` 下来就可以直接执行：

```bash
touch foo.sh
git add foo.sh
git ls-file --stage
```

此时可以看到文件输出属性是 `0644` 也就是读写权限(不可执行):

```
100644 e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 0       foo.sh
```

执行以下命令添加执行属性:

```
git update-index --chmod=+x foo.sh
```

完成后再次检查文件

```
git ls-file --stage
```

就可以看到文件属性称为 `0755` (可执行):

```
100755 e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 0       foo.sh
```

现在就可以将文件提交

```
git commit -m"Executable!"
git push
```

# 参考

* [How to create file execute mode permissions in Git on Windows?](https://stackoverflow.com/questions/21691202/how-to-create-file-execute-mode-permissions-in-git-on-windows)