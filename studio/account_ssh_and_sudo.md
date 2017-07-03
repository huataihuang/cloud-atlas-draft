个人开发服务器访问采用ssh，采用合适和巧妙的设置可以方便开发工作。

# uid/gid

日常开发测试环境以及模拟虚拟化集群部署，采用统一的个人账户登录，并且在整个环境中确保一致的 uid/gid 。这样对于NFS系统文件共享就不会出现权限异常。

> 本文环境中，个人帐号为 `huatai` ，统一 `uid` 为 501，`gid` 为 20 （将`/etc/group`中对应group名字修订成`staff`）

* 修订 `/etc/passwd` 

```
huatai:x:501:20:Huatai Huang:/home/huatai:/bin/bash
```

* 修订 `/etc/group`

```
...
wheel:x:10:huatai
...
staff:x:20:huatai
```

> `huatai`用户帐号属于`wheel`组，具备切换root的权限。

* 修正HOME目录

```
chown -R huatai:staff /home/huatai
```

# sshd配置

* 修改 `/etc/ssh/sshd_config`关闭反向DNS解析加快ssh客户端登录访问：

```
#UseDNS yes
UseDNS no
```

然后重新加载生效：

```
systemctl reload sshd
```

* 在`huatai`用户帐号的HOME目录下添加ssh公钥，以便通过密钥认证登录

# sudo配置

* 修改`/etc/sudoers`添加

```
%wheel        ALL=(ALL)       NOPASSWD: ALL
```

然后以`huatai`用户帐号登录系统后，执行`sudo su -`，确认可以无须密码切换到root帐号。

> 日常工作以普通用户`huatai`操作，执行超级用户权限则使用`sudo`