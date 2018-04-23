git的5个主要命令：

* `git clone`
* `git remote`
* `git fetch`
* `git pull`
* `git push`

操作示意图

![git远程操作示意图](img/devops/git/git_remote.jpg)

# git clone

从远程主机clone出一个版本库

```
git clone <版本库的网址>
```

例如 `git clone https://github.com/jquery/jquery.git` 在从jQuery克隆出和远程主机版本库同名的目录，也可以指定本地目录

```
git clone <版本库的网址> <本地目录名>
```

# git remote

`git remote`命令管理主机名，不带主机名列出所有远程主机，带`-v`选项，可以查看远程主机的网址

```
git remote -v
```

克隆版本库的时候，所使用的远程主机自动被Git命名为`origin`。如果想用其他的主机名，需要用`git clone`命令的`-o`选项指定。

`git remote show`命令加上主机名，可以查看该主机的详细信息。

```
git remote show <主机名>
```

`git remote add`命令用于添加远程主机。

```
git remote add <主机名> <网址>
```

`git remote rm`命令用于删除远程主机。

```
git remote rm <主机名>
```

`git remote rename`命令用于远程主机的改名。

```
git remote rename <原主机名> <新主机名>
```

# git fetch

一旦远程主机的版本库有了更新（Git术语叫做commit），需要将这些更新取回本地，这时就要用到`git fetch`命令。

```
git fetch <远程主机名>
```

上面命令将某个远程主机的更新，全部取回本地。

比如，取回origin主机的master分支。

```
git fetch origin master
```

git branch命令的`-r`选项，可以用来查看远程分支，`-a`选项查看所有分支

例如，我检查远程主机

```
git branch -r
```

显示

```
  origin/HEAD -> origin/master
  origin/compatible_7u
  origin/master
  origin/master_7u
```

显示所有分支

```
git branch -a
```

显示所有仓库分支

```
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/compatible_7u
  remotes/origin/master
  remotes/origin/master_7u
```

如果要同时查看远程分支的说明使用`-va`参数

```
git branch -va
```

* 如果只想看一下远程上游分支`概述`，则可以直接check out

```
git checkout origin/master_7u
```

显示输出处于`detachd HEAD`状态，可以查看远程分支都概述

```
Note: checking out 'origin/master_7u'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by performing another checkout.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -b with the checkout command again. Example:

  git checkout -b <new-branch-name>

HEAD is now at 2791c72... 这里还会显示上次commit的注释说明
```

此时使用 `git branch -va` 

现在我将这个`master_7u`取回并在这个分支开始工作，则增加 `-b` 参数

```
git checkout -b <新建的本地分支名>  <远程分支名>
```

实际操作如下

```
git checkout -b master_7u origin/master_7u
```

如果要跟踪多个远程仓库，可以使用 `git remote` 命令

```
git remote add win32 git://example.com/users/joe/myproject-win32-port
```

则查看分支可以看到类似

```
$ git branch -a
* master
  remotes/origin/HEAD
  remotes/origin/master
  remotes/origin/v1.0-stable
  remotes/origin/experimental
  remotes/win32/master
  remotes/win32/new-widgets
```

# git pull

`git pull`命令的作用是，取回远程主机某个分支的更新，再与本地的指定分支合并。

比如，取回`origin`主机的`next`分支，与本地的`master`分支合并，需要写成下面这样。

```
git pull origin next:master
```

如果远程分支是与当前分支合并，则冒号后面的部分可以省略。

```
git pull origin next
```

在某些场合，Git会自动在本地分支与远程分支之间，建立一种追踪关系（tracking）。比如，在`git clone`的时候，所有本地分支默认与远程主机的同名分支，建立追踪关系，也就是说，本地的`master`分支自动"追踪"`origin/master`分支。

如果当前分支与远程分支存在追踪关系，`git pull`就可以省略远程分支名。

# git push

`git push`命令用于将本地分支的更新，推送到远程主机。它的格式与`git pull`命令相仿。

```
git push <远程主机名> <本地分支名>:<远程分支名>
```

如果省略远程分支名，则表示将本地分支推送与之存在"追踪关系"的远程分支（通常两者同名），如果该远程分支不存在，则会被新建。

```
git push origin master
```

上面命令表示，将本地的`master`分支推送到`origin`主机的`master`分支。如果后者不存在，则会被新建。如果省略本地分支名，则表示删除指定的远程分支，因为这等同于推送一个空的本地分支到远程分支。


果当前分支与远程分支之间存在追踪关系，则本地分支和远程分支都可以省略。

```
git push origin
```

上面命令表示，将当前分支推送到`origin`主机的对应分支。

如果当前分支只有一个追踪分支，那么主机名都可以省略。

```
git push
```

* 根据远程分支创建本地分支（相当于从远程下载这个分支然后切换到这个分支上）

```
git checkout -b <新建的本地分支名>  <远程分支名>
```

* 删除本地分支

```
git branch -d <local_branch>
```

* 如果已经下载过远程分支，则可以直接切换

```
git checkout <本地分支名>
```

# 创建分支并推送到远程仓库

> 参考 [How do you create a remote Git branch?](https://stackoverflow.com/questions/1519006/how-do-you-create-a-remote-git-branch)

```
git checkout -b feature_autofix
# 修改，并 git commit，然后执行
git push origin feature_autofix --force
```

注意：本地分支名字必须和远程分支名字相同，例如，这里分支名字是`feature_autofix`。

# 放弃修改

如果没有提交到远程库，放弃修改:

* 先查看有哪些commit

```
git log
```

例如：

```
git log
commit d5c92f618314fb2f8759cfc77e167de3986c3548
...
commit 559770899a4e5bd8314a0ea196f433f3103dadbf
...
```

> `d5c92f618314fb2f8759cfc77e167de3986c3548`是commit但是尚未push，准备回滚到上一个版本`559770899a4e5bd8314a0ea196f433f3103dadbf`

* 回滚

```
git reset --hard 559770899a4e5bd8314a0ea196f433f3103dadbf
```

提示:

```
HEAD is now at 5597708 fix ...
```

* 然后再检查

```
git log
```

## 放弃修改并更新远程分支（方法一）

> 参考 [git 远程分支回滚](http://blog.csdn.net/u013399759/article/details/52212436)

和前文所述的放弃本地commit步骤所差异的是增加了删除远程分支和用回滚后的本地分支重建远程分支：

* 先查看有哪些commit

```
git log
```

* 建议先备份一次本地分支

```
git branch the_branch_backup
```

* 回滚本地分支

```
git reset --hard 559770899a4e5bd8314a0ea196f433f3103dadbf
```

> 如果要回最近的3次提交，则使用命令`git reset --hard HEAD~3`

* 删除远程分支

```
git push origin :the_branch
```

注意，这里分支名字前面有一个`:`

如果是master分支，使用命令是

```
git push origin :master
```

但是，远程仓库的master如果是保护分支将报错，请去掉对分支的保护设置：

```
remote: GitLab: You are  allowed  to  deleted protected branches from this project. To http://gitlab.mogujie.org/shihao/afanty.git ! [remote rejected] master (pre-receive hook declined) error: failed to push some refs to 'http://gitlab.mogujie.org/xxxx/xxxx.git'
```

* 重新创建远程master分支(这跟第１次提交本地代码库给远程仓库的命令一样)

```
git push origin master
```

## 放弃修改并更新远程分支（方法二简单，推荐）

* 本地代码回滚到上一版本（或者指定版本）

```
git reset --hard HEAD~1
```

* 加入`-f`参数，强制提交，远程端将强制跟新到reset版本

```
git push -f origin master 
```

# Git查看、删除、重命名远程分支和tag

在处理远程分支时，有时候需要删除不需要的远程分支。

* 检查远程分支

```
git branch -a
```

* 删除远程分支

```
git push origin --delete master-7u
```

* 删除tag

```
git push origin --delete tag master-7u
```

* 删除不存在对应远程分支的本地分支

```
git fetch -p
```

# 合并分支

```
git merge hoxfix
```

将hotfix分支合并到当前分支中

# 删除分支

```
git branch -d hotfix
```

删除分支hotfix，`-d`选项只能删除被当前分支所合并过的分支，要强制删除没有被合并过的分支，使用参数`-D`

# 重命名分支

```
git branch -m oldbranch newbranch
```

`-M`用来强制重命名，如newbranch已经存在的时候。

# 查看分支间的不同

```
git diff branchName
```

查看当前分支和branchName分支中间的差异。也可以使用`git diff branch1 branch2`来查看两个分支间的差异。

如果要比较文件，则使用

```
git diff <branchA>:<fileA> <branchB>:<fileB>
```

# 合并冲突

如果在不同的分支中都修改了同一个的同一部分，git就无法干净地把两者合并到一起。

任何包含未解决冲突的文件都会以未合并（unmerged）的状态列出。git会在有冲突的文件中加入标准的冲突解决标记，可以通过它们来手工定位并解决这些冲突。

在解决了所有文件里的所有冲突后，运行`git add`把它们标记为已解决状态（也就是快照保存到暂存区域）。因为一旦暂存，就表示冲突已经解决。

# 检查修改

先使用 `git log` 检查修改历史，可以看到修改的历史

```
commit 6919690e642ede8bf8caf1dd7b9d13199edfc6d4
Author: ABC <abc@gmail.com>
Date:   Mon Sep 11 11:54:05 2017 +0800

    Change 2# XXXXXXX

commit a29f0dc33a7f1ed471d28b8ad6d812d4df293538
Author: XYZ <xyz@google.com>
Date:   Fri Sep 8 11:19:50 2017 -0700

    Change 1# XXXXXX
```

然后根据commit的标识串就可以查看具体的修改，例如这里`Change 2#`的修改：

```
git show 6919690e642ede8bf8caf1dd7b9d13199edfc6d4
```

# 参考

* [Git远程操作详解](http://www.ruanyifeng.com/blog/2014/06/git_remote.html)
* [How to clone all remote branches in Git?](http://stackoverflow.com/questions/67699/how-to-clone-all-remote-branches-in-git)
* [Git查看、删除、重命名远程分支和tag](https://blog.zengrong.net/post/1746.html)
* [git branch](http://www.cnblogs.com/gbyukg/archive/2011/12/12/2285425.html)
