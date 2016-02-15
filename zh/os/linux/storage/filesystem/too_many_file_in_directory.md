在排查`/var/log/messages`日志时，有如下报错

```bash
Feb 15 09:20:02 host1.example.com sendmail[7134]: u1F1K2am007134: SYSERR(root): collect: Cannot write ./dfu1F1K2am007134 (bfcommit, uid=51, gid=51): Permission denied
Feb 15 09:20:02 host1.example.com sendmail[7134]: u1F1K2am007134: SYSERR(root): queueup: cannot create queue file ./qfu1F1K2am007134, euid=51, fd=-1, fp=0x0: Permission denied
Feb 15 09:21:01 host1.example.com sendmail[14474]: u1F1L1GP014474: SYSERR(root): collect: Cannot write ./dfu1F1L1GP014474 (bfcommit, uid=51, gid=51): Permission denied
Feb 15 09:21:01 host1.example.com sendmail[14474]: u1F1L1GP014474: SYSERR(root): queueup: cannot create queue file ./qfu1F1L1GP014474, euid=51, fd=-1, fp=0x0: Permission denied
```

究竟是什么原因导致系统邮件无法写入呢？

首先怀疑的是`/var/spool`目录下的邮件投递队列子目录权限问题（因为经常有系统运维人员清理磁盘空间时错误更改目录权限或者误删除目录）。在`/var/spool`目录下，有3个目录和操作系统的邮件收发有关

```bash
cd /var/spool
ls -l
```

输出显示

```bash
drwxr-xr-x 2 root   root   63389696 Aug 12  2014 clientmqueue
drwxrwxr-x 2 root   mail      36864 Jan  8 19:38 mail
drwx------ 2 root   mail       4096 Nov 28  2006 mqueue
````

> 这个`clientmqueue`数值比较异常（空目录`mqueue`显示的是`4096`），如果使用`ls -lh`显示，这个数值是`61M`。表示这个目录下有大量的文件存储。

使用`mount`命令检查`/`文件系统挂载

```bash
/dev/sda3 on / type ext3 (rw)
```

使用`df -i`检查文件系统`inode`使用情况，显示`inode`使用数量超过16万。

```bash
Filesystem            Inodes   IUsed   IFree IUse% Mounted on
/dev/sda3            38404096  163426 38240670    1% /
```

[kernelnewbies](http://kernelnewbies.org)网站提供了[Ext4](http://kernelnewbies.org/Ext4)文件系统的子昊是