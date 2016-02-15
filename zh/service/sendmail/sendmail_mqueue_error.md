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

上述检查inode分配，显示文件系统使用了16万的inode，使用量并不算很大。不过，使用`ls`等命令去查看`/var/spool/clientmqueue`无法正常显示文件名。

> 这个线上服务器操作系统是 RHEL 5.x，所以还是保留了Sendmail作为系统默认的邮件投递程序。

对比安装正常的RHEL 5.7操作系统，可以看到正常的目录权限是：

```bash
drwxrwx--- 2 smmsp  smmsp  120K 02-15 04:02 clientmqueue
```

所以我们修订如下：

```bash
chown smmsp:smmsp clientmqueue
chmod 770 clientmqueue/
```

完成后`/var/log/messages`日志不再出现权限错误

```bash
Feb 15 23:29:01 r11b05038.dg.aliyun.com sendmail[11761]: u1FFT1S6011761: from=root, size=416, class=0, nrcpts=1, msgid=<201602151529.u1FFT1S6011761@r11b05038.dg.aliyun.com>, relay=root@localhost
Feb 15 23:29:01 r11b05038.dg.aliyun.com sendmail[11761]: u1FFT1S6011761: to=root, ctladdr=root (0/0), delay=00:00:00, xdelay=00:00:00, mailer=relay, pri=30416, relay=[127.0.0.1] [127.0.0.1], dsn=4.0.0, stat=Deferred: Connection refused by [127.0.0.1]
```

这个报错是因为系统没有启动`sendmail`服务导致的，所以导致投递给root用户的邮件被｀Connection refused｀

此时使用系统`mail`程序

```bash
mail
```

会提示没有邮件给root用户

```bash
No mail for root
```

现在我们启动`sendmail`

```bash
#/etc/init.d/sendmail start
Starting sendmail:                                         [  OK  ]
Starting sm-client:                                        [  OK  ]
```

再次使用`mail`程序就会看到邮件投递成功

```bash
Mail version 8.1 6/6/93.  Type ? for help.
"/var/spool/mail/root": 2 messages 2 new
>N  1 root@r11b05038.dg.al  Mon Feb 15 23:38  26/1025  "Cron <root@r11b05038> /bin/freemem.py"
 N  2 root@r11b05038.dg.al  Mon Feb 15 23:38  26/1025  "Cron <root@r11b05038> /bin/freemem.py"
```

> 也就是说，邮件是`/bin/freemem.py`脚本产生的。我们现在就可以使用`mail`程序来读取cron脚本产生的邮件信息。交互命令是`p`，就可以打印当前的由于`cron`定时任务处理结果的邮件了。

**系统邮件是很多自动化处理脚本输出结果的搜集器，对于故障排查很有帮助。可惜，因为现在大规模部署，运维人员已经无法对单台服务器精耕细作，往往会选择性地忽视系统邮件和错误日志。如果没有大数据分析工具平台来帮助运维，这些有价值的数据旺旺会被暴殄天物。**

# 参考

* [Sendmail Permissions Problem](https://www.jethrocarr.com/2007/09/09/sendmail-permissions-problem/)