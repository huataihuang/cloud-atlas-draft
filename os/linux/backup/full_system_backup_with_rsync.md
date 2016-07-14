备份远程主机 `192.168.1.1` 完整的操作系统到本地目录`/backup/192.168.1.1` 目录下

```bash
rsync -a --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found"} 192.168.1.1:/ /backup/192.168.1.1/ | tee /var/log/10.195.186.137_backup.log
```

如果多次备份，则可以加上`--delete`参数，确保两者一致

* `rsync`参数`--dry-run`

对比两个目录下文件，想知道目标目录下哪些文件被修改或增加删除了，rsync提供了一个只校验文件但不实际同步目录内容的参数 `--dry-run`，结合`-vrc`参数（表示详细、递归、校验），就可以知道两个目录下文件的差异。

```bash
rsync --dry-run -rvc --delete /home/admin/dir1/ /home/admin/dir2/
```

参考 

* [Full system backup with rsync](https://wiki.archlinux.org/index.php/full_system_backup_with_rsync)
* [How to use rsync to sync local and remote directories on a VPS](https://www.digitalocean.com/community/tutorials/how-to-use-rsync-to-sync-local-and-remote-directories-on-a-vps)
* [How to compare recursively the content of two directories with rsync](http://blog-en.openalfa.com/how-to-compare-recursively-the-content-of-two-directories-with-rsync)