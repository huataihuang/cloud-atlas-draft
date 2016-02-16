可以使用`tar`命令备份整个Linux操作系统

```bash
tar -cvpzf backup.tar.gz --exclude=/backup.tar.gz --one-file-system /
```

# 参考

* [BackupYourSystem/TAR](https://help.ubuntu.com/community/BackupYourSystem/TAR)
* [Full System Backup with tar](https://wiki.archlinux.org/index.php/Full_System_Backup_with_tar)