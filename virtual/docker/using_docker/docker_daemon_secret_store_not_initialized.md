# 报错

Fedora 27执行`dnf upgrade`升级了系统之后，启动docker容器时报错：

```
Error response from daemon: secret store is not initialized
Error: failed to start containers: dev5
```

这个问题在[Bug 1515118 - Error response from daemon: secret store is not initialized [NEEDINFO]](https://bugzilla.redhat.com/show_bug.cgi?id=1515118)有说明：

原因是docker的git版本中引入检查`secret store`，如果之前使用旧版本，则这里需要跳过，相关patch见 https://github.com/projectatomic/docker/commit/ff9c1595ffa134c38dce0ca2b8c25d004f0f8675

Fedora将下一个版本修复。

当前可以采用`updates-testing`仓库中的版本，即编辑`/etc/yum.repos.d/fedora-updates-testing.repo`

```
[updates-testing]
...
enabled=1
```

然后单独更新docker软件包：

```
dnf update docker
```

更新完成后再去除掉激活的`updates-testing`，回归stable仓库。