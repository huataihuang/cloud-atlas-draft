
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

# 参考

* [Handling a Git Pull request with merge conflict](https://akshayranganath.github.io/Git-Pull-Handling-Merge-Conflict/)
* [Git Merge](https://www.atlassian.com/git/tutorials/using-branches/git-merge) - 这是非常详细的git合并指南
