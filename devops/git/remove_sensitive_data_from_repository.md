在使用github时候，有时候可能会提交了不希望公开的内容，例如帐号密码、密钥等等，此时，如果你使用 `git revert` 指令进行回滚，实际上只是用之前的commit再反过来提交一次，而git历史中依然保留了你之前提交的敏感信息。任何人只要去查看你的历史commit，就能获取你不希望暴露的信息。

解决方法在github帮助文档[Removing sensitive data from a repository](https://help.github.com/en/github/authenticating-to-github/removing-sensitive-data-from-a-repository)已经说明，即使用[BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)清理仓库：先用 BFG 扫描本地仓库，BFG会把所有历史上你已经删除的敏感信息真正从仓库中清理掉。注意：文件必须是已经 `git rm` 过的，如果当前最新提交中有这个文件，BFG不会删除。

# 详细步骤

* 从 [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) 下载 bgf.jar ，放到git本地仓库的上级目录。例如，我要清理 [cloud-atlas](https://github.com/huataihuang/cloud-atlas) 仓库，就把这个jar包放在 `cloud-atlas` 目录的上级目录中。

* 执行清理命令，清理仓库中历史中的 `authorized_keys` 文件，注意这个 `authorized_keys` 已经 `git rm` 掉过，当前最后一个commit中已经没有这个文件：

```
java -jar bfg.jar --delete-files authorized_keys cloud-atlas
```

* 清理完成后，根据提示信息，进入 `cloud-atlas` 目录，执行:

```
cd cloud-atlas

git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

* 最后强制提交到远程仓库，覆盖掉远程仓库内容:

```
git push --force
```

最后检查远程仓库，可以看到历史中包含这个 `authorized_keys` 文件内容都被清理了。

# 参考

* [Removing sensitive data from a repository](https://help.github.com/en/github/authenticating-to-github/removing-sensitive-data-from-a-repository)
* [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)