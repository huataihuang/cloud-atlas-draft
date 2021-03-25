排查 dmidecode 触发的core问题，采用如下方法

* 激活 `/etc/yum.repos.d/CentOS-Linux-Debuginfo.repo`

* 安装debuginfo文件

```
debuginfo-install dmidecode-2.11-2.1.alios6.x86_64
```

* 执行以下命令进行gdb

```
gdb --args dmidecode
```

然后输入命令

```
r
bt
```

# 参考

* ["bus error" when running under docker #249](https://github.com/tinyproxy/tinyproxy/issues/249)