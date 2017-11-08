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

# 参考

* [SSHFS](https://wiki.archlinux.org/index.php/SSHFS)