为了[在Mac上双启动方式安装Linux](develop/mac/dual_boot_linux_on_mac.md)，需要调整Mac文件系统分区大小。

在macOS High Sierra操作系统的APFS文件系统上，使用disk utility调整分区最后的收缩APFS数据结构遇到如下报错：

```
Shrinking APFS data structures
APFS Container Resize error code is 49153
A problem occurred while resizing APFS Container structures.
Operaition failed...
```

上述报错是因为在前一次Time Machine备份之后，系统定时生成了本地的TimeMachine快照，这些快照在没有备份之前没有被清理，就会导致无法resize APFS容器。

解决的方法是:

* 在TimeMachine设置中关闭"Back Up Automatically"
* 使用`tmutil deletelocalsnapshots`命令删除快照，或者全部删除

举例

```bash
tmutil listlocalsnapshots /
```

显示输出如下本地快照

```
com.apple.TimeMachine.2017-10-17-233642
com.apple.TimeMachine.2017-10-18-014202
com.apple.TimeMachine.2017-10-18-034138
com.apple.TimeMachine.2017-10-18-044104
com.apple.TimeMachine.2017-10-18-054710
com.apple.TimeMachine.2017-10-18-084918
com.apple.TimeMachine.2017-10-18-104157
com.apple.TimeMachine.2017-10-18-125026
com.apple.TimeMachine.2017-10-18-145017
```

则通过如下命令删除

```bash
tmutil deletelocalsnapshots 2017-10-17-233642
tmutil deletelocalsnapshots 2017-10-18-014202
...
```

# 参考

* [APFS Container Resize error code is 49153](https://stackoverflow.com/questions/46424915/apfs-container-resize-error-code-is-49153)