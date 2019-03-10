在分支上工作多次commit之后，需要合并到master，但是太多的分支commit合并会造成master查看困难，也没有必要。所以此时需要sqash分支的多个commit
到一个commit，然后再合并到master。

- checkout出远程分支

```
git clone git@gitlab.huatai.me:ex-app/castle.git
```

- 查看所有远程分支

```
git branch -a
```

- 将某个远程分支取出

```
git checkout -b feature-gray origin/feature-gray
```

- 检查日志

```
git log
```

显示可以看到最后有7个commit是我添加的，需要合并起来:

```
commit 9c000576b406ab0f132abd48e93e5f80dc0f096b (HEAD -> feature-gray, origin/feature-gray)
Author: 华泰 <huatai@huatai.me>
Date:   Fri Mar 8 11:49:16 2019 +0800

    修正7

commit 1617c8618018d5fb20dca0354fa12823267d575f
Author: 华泰 <huatai@huatai.me>
Date:   Fri Mar 8 10:35:17 2019 +0800

    修正6

,...
```

- 合并的方法是:

```
git rebase -i HEAD~7
```

此时会显示

```
pick 4c7aecf 修正7
pick 9aa319a 修正6
pick cfc67ce 修正5
pick 05e43d7 修正4
pick 7e42e75 修正3
pick 1617c86 修正2
pick 9c00057 修正1

....
```

修改第二行开始的第一个命令 `pink` ，修改成 `squash` 类似如下：

```
pick 4c7aecf 修正7
squash 9aa319a 修正6
squash cfc67ce 修正5
squash 05e43d7 修正4
squash 7e42e75 修正3
squash 1617c86 修正2
squash 9c00057 修正1

....
```

然后保存退出，最后会显示:

```
 Author: 华泰 <huatai@huatai.me>
 Date: Thu Feb 28 17:28:51 2019 +0800
 13 files changed, 538 insertions(+)
 create mode 100644 biz/feature-gray/XXXXX
 ...
 Successfully rebased and updated refs/heads/feature-gray.
```

- 最后再次提交

```
git push origin feature-gray --force
```


# 参考

* [Squash my last X commits together using Git](https://stackoverflow.com/questions/5189560/squash-my-last-x-commits-together-using-git)
* [Always Squash and Rebase your Git Commits](https://blog.carbonfive.com/2017/08/28/always-squash-and-rebase-your-git-commits/)