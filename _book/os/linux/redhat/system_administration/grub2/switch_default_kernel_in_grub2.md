
* 检查可使用的内核启动选项列表

```
#awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
```

显示输出有3个启动内核选项

```
0 : CentOS Linux (3.10.0-514.21.2.el7.x86_64) 7 (Core)
1 : CentOS Linux (3.10.0-327.ali2010.alios7.x86_64) 7 (Core)
2 : CentOS Linux (0-rescue-fcb7caa23aaf46d0ba593dd2232c0fad) 7 (Core)
```

* 检查当前默认启动项

```
#grub2-editenv list
```

```
saved_entry=CentOS Linux (3.10.0-514.21.2.el7.x86_64) 7 (Core)
```

* 调整设置，选择`1`作为启动项

```
#grub2-set-default 1
```

* 再次检查确认启动项

```
#grub2-editenv list
saved_entry=1
```

* 重启操作系统，即切换默认内核

# 参考

* [Setting Up grub2 on CentOS7 - 2. How to Define the Default Entries](https://wiki.centos.org/HowTos/Grub2)