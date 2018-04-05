# ssh远程登陆后只显示用户主用户组

在远程host主机上运行docker容器，容器中应用程序都是用`admin`用户运行，并且通过Docker volume方式将容器中数据共享存储到host主机的volume中。

在host主机创建`admin`用户账号，`uid`和`gid`和容器中`admin`用户相同，目的是在host主机上能够直接通过`/var/lib/docker/volumes`来访问各个容器中的共享数据，方便备份、开发和数据同步。

由于Docker的目录安全要求，`/var/lib/docker`子目录只对root用户可读写。通过以下命令适当放宽给**`root`用户组**:

```
chmod 751 /var/lib/docker
chmod 750 /var/lib/docker/volumes
```

然后将host主机上`admin`用户添加到`root`分组

```
usermod -a -G root admin
```

此时host主机上root用户切换到`admin`用户身份可以验证`admin`用户已经属于`root`用户组：

```
[root@devstack ~]# id
uid=0(root) gid=0(root) groups=0(root) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023

[root@devstack ~]# su - admin

[admin@devstack ~]$ id
uid=505(admin) gid=505(admin) groups=505(admin),0(root),10(wheel) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
```

但是，远程ssh以`admin`用户身份登陆，却发现`admin`用户的`id`是不同的，这显示主用户组`groups=505(admin)`：

```
$ ssh admin@192.168.1.12

[admin@devstack ~]$ id
uid=505(admin) gid=505(admin) groups=505(admin) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
```

# Linux系统uid和gid范围

在现代的Red Hat Linux系统，创建用户账号时候，会限制`uid`和`gid`为`1000`及以上。而以前的Red Hat Linux系统，则`uid`和`gid`从`500`开始。由于历史原因，所以容器中`admin`用户的`uid`和`gid`都采用了`505`。

操作系统限制`uid`和`gid`范围是在`/etc/login.defs`中定义的

```
#
# Min/max values for automatic uid selection in useradd
#
UID_MIN          1000
UID_MAX         60000

#
# Min/max values for automatic gid selection in groupadd
#
GID_MIN          1000
GID_MAX         60000
```

将上述`UID_MIN`和`GID_MIN`更改成`500`之后，就可以重新创建`uid`和`gid`为`505`的`admin`账号

```
groupadd -g 505 admin
useradd -u 505 -g 505 -G root,wheel -d /home/admin -m admin
```

然后再使用ssh远程登陆`admin`账号，则恢复正常的goups

```
$ ssh admin@30.17.44.12

[admin@devstack ~]$ id
uid=505(admin) gid=505(admin) groups=505(admin),0(root),10(wheel) context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
```

# 参考

* [What are the dangers of creating a normal user with UID < 500?](https://unix.stackexchange.com/questions/101313/what-are-the-dangers-of-creating-a-normal-user-with-uid-500)