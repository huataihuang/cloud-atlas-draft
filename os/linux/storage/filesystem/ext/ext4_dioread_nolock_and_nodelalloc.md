目前在Ext4文件系统中，如果使用了 `dioread_nolock` + `nodelalloc` 挂载选项，则执行缓存IO写操作，性能极差。

发现问题是在 kernel-4.19 环境，实际不同内核可能都存在这个问题，目前社区还没有确定最终解决方案。

临时解决方法，去除 `nodelalloc` 挂载参数（默认实际上就是 `delalloc` )，通过以下命令可以直接在线修改存储挂载参数:

```bash
sudo mount -o remount,delalloc <device> <mnt_point>
```

原因：

* `dioread_nolock + nodelalloc` 挂载选项组合下，Buffer IO写分配的是 `unwritten extents`，这些 `unwritten extents` 大小全部是 4KB，不会进行合并，从而导致回写时每次从 `dirty pages` 中查找到的2048个脏页，但每次只能写一个 4K 的extent，效率很低。

# 参考

* [阿里云开发者社区 Kbase #12 Ext4 文件系统 Buffer IO 写性能不及预期](https://developer.aliyun.com/article/712858)