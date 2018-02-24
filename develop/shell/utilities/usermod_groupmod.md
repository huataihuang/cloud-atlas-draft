根据以往的Unix/Linux维护经验，如果要修改用户名或者帐号的uid和gid，我常常是直接修改`/etc/group`和`/etc/passwd`/`/etc/shadow`，然后直接对用户HOME做一次递归的`chown`。

> 然而，上述方法似乎在新版本操作系统中会引发用户帐号异常（无法登录），虽然我还没有找到原因。所以，目前准备采用`usermod`和`groupmod`工具来调整，方法如下：

* 修改用户uid到新的id 1000

```
usermod -u 1000 admin
```

* 修改用户gid到新的id 1000

```
usermod -g 1000 admin
```

* 修改admin组的gid为1000

```
groupmod -g 1000 admin
```

* 在`/home`目录下将admin用户的目录修改属主

```
chown -R 1000:1000 /home/admin
```

# 参考

* [Linux Change or Rename User Name and UID (user-id)](https://www.cyberciti.biz/faq/howto-change-rename-user-name-id/)