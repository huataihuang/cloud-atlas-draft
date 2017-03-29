> 无须安装rpm方式单独解压缩rpm包获取文件，对于一些文件修补或者只需要少量文件提取的情况较为有用。

虽然`rpm`命令没有直接的选项可以加压缩RPM文件，但是有一个小工具`rpm2cpio`可以将`.rpm`文件转换成cpio归档输出

```
rpm2cpio myrpmfile.rpm
rpm2cpio - < myrpmfile.rpm
rpm2cpio myrpmfile.rpm | cpio -idmv
```

常用的解压缩命令

```
rpm2cpio myrpmfile.rpm | cpio -idmv
```

* `i` 恢复归档
* `d` 如果需要则创建前导目录
* `m` 当创建文件时保留原文件修改时间
* `v` 详细输出过程信息

# 参考

* [How To: Extract an RPM Package Files Without Installing It](https://www.cyberciti.biz/tips/how-to-extract-an-rpm-package-without-installing-it.html)