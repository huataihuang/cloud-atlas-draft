当需要checkout一个仓库的特定tag时候，不是使用 `git checkout -b` 指令，而是使用 `git fetch`

```
git fetch && git fetch --tags
```

由于tag通常不会下载，所以需要指定tag

```
git checkout v1.0.1
```

# 参考

* [Git clone a repository and checkout a specified tag](https://coderwall.com/p/k2fisg/git-clone-a-repository-and-checkout-a-specified-tag)