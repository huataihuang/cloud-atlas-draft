tar命令非常非常非常常用，但是，我们也会有一些没有注意到的功能和特性，这里做一些举例

# 在现有archive中添加文件或目录

tar包支持追加文件和目录，使用参数 `-r` ，举例在 `raspbian.tar` 包中添加 `boot` 目录打包:

```bash
tar -rvpf raspbian.tar boot
```

参数 `-p` 表示保留原先的文件权限

# 解压缩单个文件（支持压缩)

```bash
# tar -xvf cleanfiles.sh.tar cleanfiles.sh
OR
# tar --extract --file=cleanfiles.sh.tar cleanfiles.sh
```

```bash
# tar -zxvf tecmintbackup.tar.gz tecmintbackup.xml
OR
# tar --extract --file=tecmintbackup.tar.gz tecmintbackup.xml
```

# 列出tar包文件列表

```bash
tar -tvf Phpfiles-org.tar.bz2
```