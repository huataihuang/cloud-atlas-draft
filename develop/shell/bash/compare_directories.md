# 使用diff

一个简单比较两个目录文件（同一台主机）异同的方法是使用`diff`命令：

```
diff -rq DIR1 DIR2
```

这样能够看出文件的差异。

# 使用rsync

```
rsync -avnc --delete $SOURCE/ $TARGET
```

* `-c` 使用checksum来比较文件内容;可以使用`ac`或者`rc`（`-r`表示递归）
* `-n` `最重要的参数`：不修改任何内容
* `-v` 列出文件
* `--delete` 对称检查，而不是单向差异
* 最后`/`表示检查目录内，和目标对比目录内的内容

# 远程对比两个服务器上指定目录

如果要对比服务器A和服务器B上的指定目录，可以结合ssh来实现：

* 使用diff命令

```
diff <(ssh server1 'sudo ls -1aR /var/www/vhosts/domain.com') <(ssh server2 'sudo ls -1aR /var/www/vhosts/domain.com')
```

* 使用rsync

```
rsync --dry-run -rvce "ssh -p port#" user@server1:/var/www/vhosts/ /var/www/vhosts/domain.com/
```

```
         --dry-run 表示显示哪些文件被传输
        -r 表示递归
        -v 表示verbose详细模式
        -c 表示使用checksum进行文件校验，而不是只比较文件大小和时间戳
        -e 表示command行参数，也就是"ssh -p port#"
```

# 参考

* [rsync compare directories?](https://unix.stackexchange.com/questions/57305/rsync-compare-directories)
* [Using diff (or rsync) to compare folders over SSH on two different servers](http://zuhaiblog.com/2011/02/14/using-diff-to-compare-folders-over-ssh-on-two-different-servers/)
* [How to compare recursively the content of two directories with rsync](file:///home/huatai/Dropbox/wiki/my_wiki.html)