通过`virt-clone`复制出ubuntu 16的kvm虚拟机，并且使用了`virt-sysrep`工具初始化clone出来的虚拟机。

但是发现clone后虚拟机虽然启动sshd，准备运城登录却发现服务器端每次ssh连接立即断开，从服务器`systemctl status sshd`可以看到如下报错：

```
error: Could not load host key: /etc/ssh/ssh_host_ed25519_key
fatal: No supported key exchange algorithms [preauth]
...
```

参考 [[SOLVED] SSH: Could not load host key: /etc/ssh/ssh_host_rsa_key](https://bbs.archlinux.org/viewtopic.php?id=165382)

执行如下命令创建主机ssh key:

```
/usr/bin/ssh-keygen -A
```

然后重新加载sshd

```
systemctl reload sshd
```