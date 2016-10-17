# 修改core dump存储位置

`/proc/sys/kernel/core_pattern` 设置了生成core文件的路径，参考 `man core`

```
echo '/tmp/core_%e.%p' | sudo tee /proc/sys/kernel/core_pattern
```

上述命令可以使得core文件保存在`/tmp`目录下的 `core_[program].[pid]`

# 参考

* [Changing location of core dump](http://stackoverflow.com/questions/16048101/changing-location-of-core-dump)