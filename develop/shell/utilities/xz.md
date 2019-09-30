xz是比gzip更好的压缩工具，目前已经得到新版本tar的集成支持，所以使用非常方便。

* 压缩

```
tar cfJ win10.tar.xz win10.xml win10.qcow2
```

`-J` 参数表示使用xz压缩算法

* 解压缩

```
tar xfJ win10.tar.xz
```

如果是早期tar版本，则采用管道

* 压缩

```
tar cf - directory/ | xz -z - > directory.tar.xz
```

* 解压缩

```
unxz < file.tar.xz > file.tar
xz -dc < file.tar.xz > file.tar
```

# 参考

* [Create a tar.xz in one command](https://stackoverflow.com/questions/18855850/create-a-tar-xz-in-one-command)
* [How do I uncompress a tarball that uses .xz?](https://askubuntu.com/questions/92328/how-do-i-uncompress-a-tarball-that-uses-xz)