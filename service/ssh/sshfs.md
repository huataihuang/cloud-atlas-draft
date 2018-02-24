[SSHFS](https://github.com/libfuse/sshfs)是一个基于FUSE的文件系统客户端，用户通过[SSH](https://wiki.archlinux.org/index.php/SSH)挂载目录。

> 以下实践在CentOS 7上实现

# 安装

```
sudo dnf install sshfs
```

# 挂载

远程挂载文件目录非常简单

```
$ sshfs [user@]host:[dir] mountpoint [options]
```

举例

* 执行sshfs挂载

```
sshfs admin@192.168.1.12:/home/share-data /home/share-data -C
```

> 如果远程主机的ssh端口是9876，则`sshfs`命令还可以加上参数`-p 9876`
>
> `-C`表示启用网络压缩，可以减轻网络流量

* 卸载sshfs挂载

```
fusermount -u /home/huatai/Documents/devstack/share-data
```

> 如果无法卸载，则通过杀死`sshfs`进程来卸载（注意先执行`sync`指令来刷缓存到磁盘确保数据安全）

```
sync
sync
sync
ps aux | grep "sshfs admin@192.168.1.12:/home/share-data /home/share-data -C" | awk '{print $2}' | xargs kill
```

# 异常错误排查

## 能够保存文件，但是git时提示`fatal: could not set 'core.filemode' to 'true'`

在使用sshfs远程挂载了服务器上的目录后，使用`git clone`同步代码，却发现出现以下报错：

```
$ git clone git@mygitserver.example.com:myproject/myapp.git
Cloning into 'myapp'...
error: could not write config file /home/huatai/Documents/myapp/.git/config: Operation not permitted
fatal: could not set 'core.filemode' to 'true'
```

> 这个报错在以往sshfs远程挂载服务器文件系统没有遇到过，怀疑和服务器端的sshd版本有关。出现异常的服务器环境是CentOS 5.7操作系统，对应的客户端是Fedora 27。（正常的案例中，服务器端是CentOS 7.3+, Fedora 26）

不过，上述sshfs挂载的远程服务器目录能够正常读写文件，所以改为在服务器端直接使用git绕开问题。

## sshfs挂载时报错`Transport endpoint is not connected`

> 这个报错可能和使用多路复用有关，在这个操作中，我使用了Jetbrains的DataGrip工具，通过ssh tunnel访问远程服务器上Docker容器中的mysql。此时再使用sshfs挂载远程服务器的目录时提示报错

```
sshfs admin@192.168.44.11:/var/lib/docker/volumes/share-data/_data /home/huatai/Documents/devstack/share-data -C
```

报错

```
fuse: bad mount point `/home/huatai/Documents/devstack/share-data': Transport endpoint is not connected
```

此时`df`命令并不能看到挂载的远程目录，但是使用`mount`命令可以看到远程目录已经挂载

```
admin@30.17.44.11:/var/lib/docker/volumes/share-data/_data on /home/huatai/Documents/devstack/share-data type fuse.sshfs (rw,nosuid,nodev,relatime,user_id=1000,group_id=1000)
```

解决方法参考[Transport endpoint is not connected](https://stackoverflow.com/questions/24966676/transport-endpoint-is-not-connected)

强制卸载

```
fusermount -uz /home/huatai/Documents/devstack/share-data
```

> * `-u` 表示umount
> * `-z` 表示force强制

然后就可以再次挂载

[sshfs: Transport endpoint is not connected](http://slopjong.de/2013/04/26/sshfs-transport-endpoint-is-not-connected/)提供的解决方法是增加一个`-o allow_other`参数允许非root用户挂载，不过要修改`/etc/fuse.conf`配置，取消`user_allow_other`的注释。

# 参考

* [SSHFS](https://wiki.archlinux.org/index.php/SSHFS)