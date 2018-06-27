在一些服务器上通过脚本安装rpm包时候出错（脚本是通过检查`rpm`命令执行后的返回码来判断逻辑），类似：

```
sudo rpm -Uvh --force /tmp/XXXXX.x86_64.rpm --nodeps
```

此时控制台没有任何输出，但是明显没有安装成功，因为此时执行`echo $?`，输出显示`135`。

这个`135`的错误码表示什么意思？

[Package Already Installed](https://www.centos.org/docs/5/html/5.1/Deployment_Guide/s3-rpm-errors.html)提到了软件包已经安装的情况。上述安装命令中`--force`和`--nodeps`如果没有的话，是否会提示信息呢？

> 似乎系统有什么bug，仅仅使用`sudo rpm -Uvh /tmp/XXXXX.x86_64.rpm`或者`sudo rpm -ivh /tmp/XXXXX.x86_64.rpm`都没有提供输出信息。

不过，检查系统，确实发现同名并且同一个版本的rpm已经安装

```
sudo rpm -qa | grep XXXXX
```

为了能够再次安装，采用先删除该软件的rpm信息，但是不删除实际文件的方法，即使用`--justdb`参数

```
sudo rpm -e --justdb XXXX
```

但是，非常奇怪，上述删除软件包信息的参数`--justdb`依然没有生效，再次查询`sudo rpm -qa | grep XXXXX`依然同样存在软件包。

一狠心，直接使用`sudo rpm -e XXXX`，居然也没有清理掉软件包。

仔细检查了系统的`rpm`软件包库信息文件，发现一个蹊跷，在`/var/lib/rpm`目录下的db文件已经损坏了，因为明显看到`__db.002`大小为`0`:

```
-rw-r--r-- 1 root root 1.6M May 17 16:35 __db.001
-rw-r--r-- 1 root root    0 May 17 16:35 __db.002
```

重建rpm数据库

```
sudo rpm --rebuilddb
```

上述命令执行之后，可以看到库文件恢复正常大小

```
-rw-r--r-- 1 root root 1.6M May 22 23:30 __db.001
-rw-r--r-- 1 root root 176K May 22 23:30 __db.002
-rw-r--r-- 1 root root 669K May 22 23:30 __db.003
```

此时再次安装软件包就可以完成

```
$sudo rpm -Uvh --force /tmp/XXXX.x86_64.rpm --nodeps
Preparing...                          ################################# [100%]
Updating / installing...
   1:XXXX       ################################# [100%]
```

# 参考

* [RPM - Rebuilding a RPM database NFAQ](https://www.informatimago.com/linux/rpm-rebuilddb.html)