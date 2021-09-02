# 手工修正冲突文件

git系统显示有潜在冲突:

```
git fetch
git checkout release/v1.1.7-hotfix
git merge origin/master
```

这里 `git merge origin/master` 自动合并提示

```
CONFLICT (content): Merge conflict in XXXXXX
Automatic merge failed; fix conflicts and then commit the result.
```

检查方法，此时通过 `vi` 编辑冲突的文件可以看到

```
data = open('cert2.txt').read()
	cert = TLSCertificate()
	<<<<<< HEAD
	print cert.loadCertificate(data)
	====== prod
	# print "hello world"
```

这表明在提交版本之前，有人修改了master分支增加了一行 `# print "hello world"` 导致无法自动合并，所以需要手工修改

```
data = open('cert2.txt').read()
	cert = TLSCertificate()
	print cert.loadCertificate(data)
```

然后再次提交

```
git add .
git commit -m "fix merge conflict"
git push origin release/v1.1.7-hotfix
```

# 放弃远程修改并标记文件冲突解决

有时候你在本地做了大量修订，准备提交修改，却发现远程文件已经被修改过，此时你通常需要:

```bash
git pull
```

将远程的变化文件拉取下来，自动和本地文件进行合并，这样才能确保本地更新的文件可以提交上去。但是，有时候本地文件和远程文件无法自动合并，提示错误:

```
git diff
```

显示

```
Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   build/doctrees/environment.pickle
        both modified:   build/doctrees/linux/alpine_linux/index.doctree
        both modified:   build/html/searchindex.js
```

本地最新文件和远程文件冲突且不能自动合并。此时如果你能够判定本地文件是完全正确，想要覆盖远程文件，有一个简单的方法：

`git checkout` 提供了一个 `--ours` 来表示本地checkout的文件，相对的远程文件则是 `--theirs` ，你可以传递 `.` 给 `git checkout` 命令告诉它check out出代码树的所有内容，然后标记所有冲突已经解决( `-u` )，最后就可以 ``commit`` 你本地文件了:

```bash
git checkout --ours .    #checkout 出本地版本的所有文件
git add -u               #标记所有冲突文件已经合并，也就是把checkout出来冲突的本地文件(未合并)也认为解决合并好了，可以加入到提交git
git commit               #提交合并，这样本地文件就会提交覆盖远程文件
git push
```

# 参考

* [Handling a Git Pull request with merge conflict](https://akshayranganath.github.io/Git-Pull-Handling-Merge-Conflict/)
* [Git Merge](https://www.atlassian.com/git/tutorials/using-branches/git-merge) - 这是非常详细的git合并指南
* [How can I discard remote changes and mark a file as "resolved"?](https://stackoverflow.com/questions/2073841/how-can-i-discard-remote-changes-and-mark-a-file-as-resolved)
