Git创建分支：

```
git checkout -b iss53
```

相当于

```
git branch iss53
git checkout iss53
```

合并分支到主干

```
git checkout master
git merge iss53
```

也可以把主干合并到分支（假如当前在iss53分支）

```
git merge iss53
```

# 参考

* [Git - 分支的新建与合并](https://git-scm.com/book/zh/v1/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%9A%84%E6%96%B0%E5%BB%BA%E4%B8%8E%E5%90%88%E5%B9%B6)