在使用rpm命令时提示错误"error: Failed to initialize NSS library":

```
$ rpm -qa
error: Failed to initialize NSS library
```

这个问题通过google搜索能够找不少解决方法，大多数都是围绕libnspr4库文件，如[Linux : Yum/rpm broken upgrading from CentOS/RHEL 7.3 to 7.4 (error: Failed to initialize NSS library)](https://www.itechlounge.net/2017/09/linux-yumrpm-broken-upgrading-from-centosrhel-7-3-to-7-4-error-failed-to-initialize-nss-library/)介绍；或者如[Bug 1476031 - Failed to initialize NSS library](https://bugzilla.redhat.com/show_bug.cgi?id=1476031)说明的，由于`nss-softokn-freebl`升级但是`nspr`没有升级，一般解决的方法是通过将rpm包下载（例如回滚到原有版本）以后，在通过`rpm2cpio`解压缩，手工复制修复。

不过，也有可能是由于其他库文件损坏导致，此时虽然看上去是NSS库初始化失败，但是实际上需要修复其他库文件。

检查的方法是采用`strace`，这个工具提供了`-eopen`参数来跟踪执行命令所使用的文件。注意：有些和语言相关的`xxx.mo`文件虽然不存在但是也不影响运行（对比正常服务器）。

不过，即使文件完全准确存在也可能出现异常，所以通过`strace rpm`命令检查完整的库文件调用顺序，查看出现异常是哪个文件：

```
strace rpm
```

显示错误最后调用的库文件是`/lib64/libfreeblpriv3.so`

```
...
open("/lib64/libfreeblpriv3.so", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\0;\0\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0755, st_size=526912, ...}) = 0
mmap(NULL, 2631448, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f7f206e6000
mprotect(0x7f7f20763000, 2093056, PROT_NONE) = 0
mmap(0x7f7f20962000, 12288, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x7c000) = 0x7f7f20962000
mmap(0x7f7f20965000, 14104, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f7f20965000
close(3)                                = 0
mprotect(0x7f7f20962000, 8192, PROT_READ) = 0
munmap(0x7f7f2afa6000, 35038)           = 0
munmap(0x7f7f206e6000, 2631448)         = 0
open("/proc/sys/crypto/fips_enabled", O_RDONLY) = 3
fstat(3, {st_mode=S_IFREG|0444, st_size=0, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f7f2afbd000
read(3, "0\n", 1024)                    = 2
close(3)                                = 0
munmap(0x7f7f2afbd000, 4096)            = 0
open("/usr/share/locale/locale.alias", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=2502, ...}) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f7f2afbd000
read(3, "# Locale name alias data base.\n#"..., 4096) = 2502
read(3, "", 4096)                       = 0
close(3)                                = 0
munmap(0x7f7f2afbd000, 4096)            = 0
open("/usr/share/locale/en_US.UTF-8/LC_MESSAGES/rpm.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en_US.utf8/LC_MESSAGES/rpm.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en_US/LC_MESSAGES/rpm.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en.UTF-8/LC_MESSAGES/rpm.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en.utf8/LC_MESSAGES/rpm.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
open("/usr/share/locale/en/LC_MESSAGES/rpm.mo", O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, "error: ", 7error: )                  = 7
write(2, "Failed to initialize NSS library"..., 33Failed to initialize NSS library
) = 33
exit_group(1)                           = ?
+++ exited with 1 +++
```

检查对比发现，异常的`/lib64/libfreeblpriv3.so`文件时间戳

```
$ls -lh /lib64/libfreeblpriv3.so
-rwxr-xr-x 1 root root 515K Sep 15  2017 /lib64/libfreeblpriv3.so
```

而正常的服务器上这个时间戳比较早

```
$ls -lh /lib64/libfreeblpriv3.so
-rwxr-xr-x 1 root root 503K Dec 14  2015 /lib64/libfreeblpriv3.so
```

所以在正常服务器上检查这个文件属于哪个rpm包

```
$rpm -qf /lib64/libfreeblpriv3.so
nss-softokn-freebl-3.16.2.3-13.1.alios7.x86_64
```

然后手工下载rpm并解压缩后修复：

```
rpm2cpio nss-softokn-freebl-3.16.2.3-13.1.alios7.x86_64.rpm |cpio -imdv
cp usr/lib64/* /lib64/
```


# 参考

* [Bug 1353159 - dnf and rpm stopped working with error 'Failed to initialize NSS library' after updating](https://bugzilla.redhat.com/show_bug.cgi?id=1353159)