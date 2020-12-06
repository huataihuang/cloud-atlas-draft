# tag

tag是git版本的一个快照，指向某个commit的指针。一旦创建tag，则不会随着后续commit的变化而变化，是一个固定不变的版本。

在产品发布时，使用tag可以明确版本，对应的commit点是不可变更的。

> 和branch不同，branch是一系列commit，有一个HEAD指针不断变化移动。简单来说，如果修改代码就使用branch，如果不改动(例如发布)就使用tag。

## tag使用

* 创建tag是基于本地分支的commit。但是需要注意的是，tag推送和分支推送是两件事，即使分支已经推送到远程服务器上，tag仍然没有推送，需要单独执行tag推送命令。

* 创建本地tag:

```bash
git tag <tagName>
```

* 将tag推送到远程仓库

```bash
git push origin <tagName>
```

* 如果有多个本地标签需要一次性推送可以使用如下命令:

```bash
git push origin --tags
```

* 查看当前分支的提交历史，包含commit id

```bash
git log --pretty=online
```

* 查看本地某个tag的详细信息

```
git show <tagName>
```

* 查看本地所有tag:

```
git tag
git tag -l
```

* 查看远程所有tag

```
git ls-remote --tags origin
```

* 删除本地tag

```
git tag -d <tagName>
```

* 删除远程tag:

```
git push origin :<tagName>
```

* 重命名tag本质上是删除掉旧tag然后再创建新tag

如果tag只存在本地，使用以下命令

```
git tag -d <oldTagName>
git tag <newTagName>
```

如果tag已经推送到远程，则不仅需要删除本地还需要删除远程的，然后再重新创建和推送

```
git tag -d <oldTagName>
git push origin :<oldTagName>
git tag <newTagName>
git push origin <newTagName>
```

# 检出标签

* 检出tag

```
git checkout <tagName>
```

注意：此时git会提示你处于一个 `detached HEAD` 状态，因为tag是快照，不能修改代码。

* 如果要在tag代码基础上做修改，需要检出这个tag并创建一个新的分支 `-b <branchName>`

```
git checkout -b <branchName> <tagName>
```

# 参考

* [Git的tag作用和使用场景以及branch的区别](https://blog.csdn.net/qq_32452623/article/details/73949509)