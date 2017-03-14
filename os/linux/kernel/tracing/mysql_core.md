> 本文是为DB开发同学设置mysql core的笔记，当时环境`kill -11 ${pidof mysqld}`没有正确生成core文件，所以对环境做了检查。

# 尝试

* 检查环境，发现好像是 `suid_dumpable`没有设置正确

```
-bash-4.1$ cat /proc/sys/fs/suid_dumpable
0
```

使用root身份修改

```
echo 2 > /proc/sys/fs/suid_dumpable
```

* 切换到root用户

```
mkdir /tmp/corefiles
chmod 777 /tmp/corefiles
echo “/tmp/corefiles/core” > /proc/sys/kernel/core_pattern
```

> 我检查环境原先 `/proc/sys/kernel/core_pattern` 就是 `/tmp/corefiles/core`
>
> 原先 `/proc/sys/kernel/core_uses_pid` 值就是 `1`

再验证一遍环境

```
-bash-4.1$ cat /proc/sys/fs/suid_dumpable
2
-bash-4.1$ cat /proc/sys/kernel/core_pattern
/tmp/corefiles/core
-bash-4.1$ cat /proc/sys/kernel/core_uses_pid
1
```

* 杀进程触发

```
kill -sigsegv `pidof mysqld`
```

发现`-sigsegv`没有反应，改为`-11`

```
kill -11 `pidof mysqld`
```

此时再看`/tmp/corefiles`目录下就生成了`core.14549` （这个pid就是被杀死pid对应的core文件）

# 参考

* [Getting MySQL Core file on Linux](https://www.percona.com/blog/2011/08/26/getting-mysql-core-file-on-linux/)