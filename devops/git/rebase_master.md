在分支开发时候，遇到别的同事更新了master分支，此时如果要请求merge到master分支会出现冲突。

解决的方法是rebase，即把master分支重新拿过来，把自己修改的内容重新加入

举例：

* 已经从master创建了分支 `-gray`

```
git clone XXXXX

# 基于master创建分支
git checkout -b feature-gray
# 修改，并 git commit，然后执行
git push origin feature-gray --force
```

* 过了几天，有同事修改了master，则我在现在的 feature_gray 创建一个分支，并rebase主干

```
git checkout -b feature-gray-tmp
git pull --rebase origin master
```

此时， `feature-gray-tmp` 就包含了我最新的代码并基于主干，然后强制把这个 `feature-gray-tmp` 分支覆盖远程的 `feature-gray`

```
git push origin feature-gray-tmp:feature-gray -f
```

这样远程的分支 `feature-gray` 就是符合最新代码和基于主干。