如果git commit的message包含了不清晰，错误或者敏感信息，你可以在本地amend(修改)然后再push一个带有新的message的commit到Git仓库。你而已可以修改commit message来添加缺失的信息。

# 重写最近commit消息

你可以使用命令 `git commit --amend` 来修改最近commit的message。

在Git中，commit message的文本内容就是commit的一部分。修改一个commit message就会修改commit ID，例如使用SHA1 checksum作为commit的名字。通常你可以创建一个新的commit来代替旧的commit。

## commit还没有在线推送的情况

如果一个commit还在本地仓库，并没有被推送到远程Git仓库，就可以使用 `git commit --amend` 命令直接修订commit的message。

## 修改旧的或多个commit消息

如果已经把commit推送到Git仓库，你就必须使用一个修订过的message来强制推送(force push)一个commit。

> 不推荐使用force push，这会导致修改仓库历史。如果你force push，那么其他人已经clone过你的软件仓库，就必须手工修复他们本地历史。

### 修改最近推送的commit消息

* 修订commit消息:

```bash
git commit --amend
```

* 使用 `--force` 参数强制push覆盖掉旧的commit

```bash
git push --force example-branch
```

### 修改较老的或者多个commit消息

如果需要修改多个commit或者较旧的commit，你可以使用交互方式rebase，然后强制推送来修改commit历史：

* 在命令行进入包含你需要修改commit的仓库位置
* 使用命令 `git rebase -i HEAD~n` 命令来显示最近 n 个commit

```bash
# 显示当前分支最近3个commit
git rebase -i HJEAD~3
```

则显示类似如下

```bash
pick e499d89 Delete CNAME
pick 0c39034 Better README
pick f7fde4a Change the commit message but push the same commit.

# Rebase 9fdb3bd..f7fde4a onto 9fdb3bd
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

* 把所有你希望修改的commit message行开头的 `pick` 改成 `reword` ，例如类似如下

```bash
pick e499d89 Delete CNAME
reword 0c39034 Better README
reword f7fde4a Change the commit message but push the same commit.
```

* 保存并关闭commit list文件

* 在每个影响的commit文件，输入新的commit消息，保存文件并关闭它。

* 当已经修改完毕，你就可以push修改，注意需要使用 `--force` 参数来强制覆盖旧的commit:

```bash
git push --force example-branch
```

# 参考

* [Changing a commit message](https://docs.github.com/en/free-pro-team@latest/github/committing-changes-to-your-project/changing-a-commit-message)