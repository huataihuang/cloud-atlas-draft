# 准备

需要生成应用程序的core文件之前，首先要设置用户的limits。首先检查当前core文件限制

```
ulimit -c
```

如果输出值是 `0` 则表示不生成core文件，需要修改这个值表示能够生成的core文件大小。设置成 `unlimited` 则表示文件大小无限制。

- 放开core文件大小

```
ulimit -c unlimited
```

如果要始终生效，则修改 `/etc/security/limits.conf`

- core文件生成的位置取决于 `/proc/sys/kernel/core_pattern` 的设置，例如设置成

```
echo '/tmp/core_%e.%p' | sudo tee /proc/sys/kernel/core_pattern
```

则core文件会记录在 `/tmp` 目录下的

- 要在生成core文件同时压缩这个core文件，需要将 `/proc/sys/kernel/core_pattern` 第一个字符修改成管道符 `|` ，然后跟随一个处理脚本：

例如，创建一个 `/home/huatai/core.sh` 脚本

```
#!/bin/sh
/bin/gzip -f - > /home/huatai/core-$1-$2-$3.gz
```

- 然后修改 `/proc/sys/kernel/core_pattern`

```
echo '|/home/huatai/core.sh %e %p %u' | sudo tee /proc/sys/kernel/core_pattern
```

- 然后测试，例如启动一个图形管理程序 `ristretto`

```
ristretto &
```

此时会显示进程id，例如 `13551`

- 现在给这个进程发送退出信号

```
kill -QUIT 13551
```

也可以使用 `-3` 参数

```
kill -3 13551
```

此时就会生成一个文件 `core-ristretto-13551-501.gz` 文件。

当然，你可以修改这个脚本 `core.sh` 增加更多逻辑，例如：

* 限定时间内只允许生成一定数量的core
* 自动清理超过一定时间或一定数量的core文件（用find）
* 自动提交bug

# 参考

* [kill: Creating a core dump](https://bencane.com/2011/09/22/kill-creating-a-core-dump/)
* [compressing the core file during core generation](https://stackoverflow.com/questions/5063295/compressing-the-core-file-during-core-generation)
* [core_pattern](https://www.mjmwired.net/kernel/Documentation/sysctl/kernel.txt#141)