备份远程主机 `192.168.1.1` 完整的操作系统到本地目录`/backup/192.168.1.1` 目录下

```bash
rsync -a --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found"} 192.168.1.1:/ /backup/192.168.1.1/ | tee /var/log/10.195.186.137_backup.log
```

如果多次备份，则可以加上`--delete`参数，确保两者一致

参考 

* https://wiki.archlinux.org/index.php/full_system_backup_with_rsync
* https://www.digitalocean.com/community/tutorials/how-to-use-rsync-to-sync-local-and-remote-directories-on-a-vps