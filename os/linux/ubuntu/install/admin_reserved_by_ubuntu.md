以往在CentOS上安装系统，会设置一个普通账号命名为`admin`，并赋予`sudo`权限。

但是在Ubuntu系统中，`admin`账号名已经被保留无法使用，例如，在安装过程中，试图创建一个名为`admin`的普通用户，则会提示错误：

```
The username you entered (admin) is reserved for use by the system.
Please select a different one.
```

实际上，Ubuntu 16.04并没有实际使用名字为`admin`的用户名，但是默认创建了一个`admin`用户组。这是一个特殊的用户组，属于这个用户组的用户被赋予`sudo`权限（类似于CentOS中的`sudo`组）。所以系统拒绝创建`admin`用户。

> 曾经尝试过创建一个其他名字的普通用户，例如`toor`（实际是`root`反写），然后在安装完成后手工编辑`/etc/passwd`，将这个用户名修改成`admin`。但是导致账号无法登陆。

以下命令可以检查所有用户名和组名（去重）：

```
grep -hPo '^.+?(?=:)' /etc/passwd /etc/group | sort -u
```

# 参考

* [How should one name “admin” user?](https://askubuntu.com/questions/900977/how-should-one-name-admin-user)