我们知道在文件系统中，磁盘不仅有容量限制，也存在文件数量存储限制(`inode` )限制。我们可以通过 `df -i` 可以看到每个磁盘挂载目录下inode消耗程度。

```bash
df -i
```

显示输出

```
...
/dev/vda1        2621440 2610815     10625  100% /
```

但是，在生产环境中，我们不仅需要知道挂载的磁盘目录inode消耗情况，还需要找出是哪个子目录(程序目录)消耗了大量的inode。

参考 [Find where inodes are being used](https://unix.stackexchange.com/questions/117093/find-where-inodes-are-being-used)

使用以下命令可以检查到底是哪个目录下占用了大量文件。这个命令非常有用，最近在线上排查问题用到了这个方法

```
find / -xdev -printf '%h\n' | sort | uniq -c | sort -k 1 -n
```

参数解释：

- `-xdev` 参数表示 `-xdev  Don't descend directories on other filesystems.` 也就是检查 `/` 根文件系统所在的设备上目录，不会涉及到其他设备上的子目录。例如 `/home` 可能挂载另一个设备，就不会包含。
- `-printf '%h\n'` 参数中 `'%h\n'` 的 `%h` 表示在文件前面导引目录，你可以理解成对于目录文件，就只显示目录，过滤掉目录下的文件名。对于检查当前目录，则就会替换成 `.` 。在检查目录下文件数量，这个参数非常有用，帮助过滤掉了目录下文件名，省却了自己编写过滤文件名的麻烦。
  - 你可以在自己的 `$HOME` 目录下测试一下命令 `find $HOME -xdev -printf '%h\n'` 就能够感受到这个参数的巧妙。
- `| sort | uniq -c` 则比较简单，就是对相同项排序后计数
- `| sort -k 1 -n` 稍微生僻一些， `-k 1` 表示对第一列进行排序， `-n` 表示排序按照数值排序。

结果显示类似

```
   1004 /usr/bin
   1127 /usr/share/man/man3p
   1198 /usr/src/kernels/4.9.151-015.ali3000.alios7.x86_64/include/linux
   1220 /usr/share/man/man1
   2632 /usr/share/man/man3
2450765 /tmp/exec
```

我们就可以判断出现问题的目录是 `/tmp/exec` ，进一步检查该目录下的文件可以帮助我们定位问题。如果文件删除时文件具柄没有释放，则用 `lsof | grep "/tmp/exec"` 可以帮助我们轻易找到这个删除文件但没有释放具柄的进程。

但是，如果文件大量存在，通常是日志和临时文件，则并没有进程在使用它。我们该如何找出这个 `疯狂` 生成文件的进程呢？

这个方法在我之前排查 [找出瞬间消失的TCP网络连接进程](find_short_lived_tcp_connections_owner_proce) 类似，采用 `audit` 进行审计记录，以便能够找出异常的进程。我在 [找出inode消耗原因](find_inode_consume) 过程中详细记录排查过程。

# 参考

* [Find where inodes are being used](https://unix.stackexchange.com/questions/117093/find-where-inodes-are-being-used)