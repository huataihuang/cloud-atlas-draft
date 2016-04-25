# `page allocation failure. order:1, mode:0x20`

如果是不断出现 `kernel: swapper: page allocation failure. order:1, mode:0x20` 则可能是内核bug，需要升级到 `kernel-2.6.32-358.el6`以上。

升级以后，仍然可能会出现上述的内存分页错误，则在 `/etc/sysctl.conf` 中添加

```
vm.min_free_kbytes = 512000
vm.zone_reclaim_mode = 1
```

> 参考
>
> * [CentOS 6: strange page allocation failure messages](http://serverfault.com/questions/494756/centos-6-strange-page-allocation-failure-messages)
> * []
