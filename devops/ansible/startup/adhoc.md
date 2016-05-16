`ad-hoc`命令是一些希望快速执行，但是不想保存以后使用的工作。也就是说，playbooks是可以反复执行的动作组合，而`ad-hoc`命令则是快速完成的命令。

# 并发和shell命令

以下指令以10个并发fork来完成重启分组`atlanta`服务器

```bash
ansible atlanta -a "/sbin/reboot" -f 10
```

默认情况下`ansible`使用当前帐号执行命令，如果需要使用不同帐号，添加`-u username`

```bash
ansible atlanta -a "/usr/bin/foo" -u username
```

如果希望执行`sudo`