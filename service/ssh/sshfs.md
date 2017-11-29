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

# 参考

* [SSHFS](https://wiki.archlinux.org/index.php/SSHFS)