# 配置XEN虚拟机kernel dumps

* 修改`/etc/xen/xend-config.xsp`

将

```
(enable-dump no)
```

修改成

```
(enable-dump yes)
```

> 默认dump文件存储位置配置 `(dump-path '/var/xen/dump')`

* 修改vm配置文件的需要特性 - 编辑 `/etc/xen/images/vm/<vm name>`

```
on_crash=”coredump-restart” or "coredump-destroy"
```

* 以root身份重启xend

```
service xend restart
```

* 测试配置

以root身份连接到vm控制台，并使用root登录

```
xm console <vm name>
```

在虚拟机内部执行如下命令

```
modprobe crasher call_panic=1
```

此时，在XEN host主机运行

```
xm dump-core <vm name>
```

在`/var/xen/dump`目录下即生成虚拟机core文件

> Windows虚拟机的core dump参考[Troubleshooting Virtual Machine Crashes](http://techgenix.com/troubleshooting-virtual-machine-crashes/)和[Windows Bugcheck Analysis](https://social.technet.microsoft.com/wiki/contents/articles/6302.windows-bugcheck-analysis.aspx)

# 检查core文件对应内核版本

```
sudo strings -n 50 vm_name.core | head -n 30000 | grep -m 1 '^Linux version'
```

输出

```
Linux version 2.6.32-279.el6.x86_64 (vm_server_name) (gcc version 4.4.6 20120305 (Red Hat 4.4.6-4) (GCC) ) #1 SMP Fri Jun 22 12:19:21 UTC 2012
```

# 参考

* [Configure a XEN Virtual Machine (domu) for a kernel / core dump](Configure a XEN Virtual Machine (domu) for a kernel / core dump)
* [Xen Debugging](http://www-archive.xenproject.org/files/xensummit_intel09/xen-debugging.pdf)
* [Core dump Xen domU/guests](https://srikrishnadas.wordpress.com/2011/09/28/core-dump-xen-domuguests/)
* [Generating Guest Dump Files on Oracle VM Server (x86)](http://docs.oracle.com/cd/E64076_01/E64083/html/vmadm-tshoot-vm-core-dump.html)
* [xen dump-core format](http://xenbits.xen.org/docs/4.4-testing/misc/dump-core-format.txt)