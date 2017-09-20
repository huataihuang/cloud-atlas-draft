在排查 [systemd管理rc.local启动](../../../os/linux/redhat/system_administration/systemd/rc_local) 问题时，发现每次安装rpm包的时候，原本系统中`/etc/rc.d/rc.local`的软链接文件`/etc/rc.local`被错误替换成了一个实体文件。

> 以下案例假设安装包名`example-rpm-package`，该rpm包包含了修订`rc.local`的操作。

# 排查过程

删除掉 `example-rpm-package` 可以看到`/etc/rc.local`被恢复成和`/etc/rc.d/rc.local`相同的旧版本。但是，请注意，这两个文件是完全独立的，并没有软链接关系！！！

```
sudo rpm -e example-rpm-package-1.1-release90.el7.x86_64
```

```
$ls -lh /etc/rc.local
-rwxr-xr-x 1 root root 786 Sep  4 19:37 /etc/rc.local

$md5sum /etc/rc.local
7970f518f50260f6f0421d83c45311d0  /etc/rc.local

$ls -lh /etc/rc.d/rc.local
-rwxr-xr-x 1 root root 786 Aug 29 14:51 /etc/rc.d/rc.local

$md5sum /etc/rc.d/rc.local
7970f518f50260f6f0421d83c45311d0  /etc/rc.d/rc.local
```

我们现在来恢复`/etc/rc.local`到`/etc/rc.d/rc.local`的软链接，然后看再次安装`example-rpm-package`包是否会破坏这个软链接

```
$sudo rm -f /etc/rc.local

$cd /etc/

$sudo ln -s rc.d/rc.local .

$ls -lh /etc/rc.local
lrwxrwxrwx 1 root root 13 Sep  4 19:42 /etc/rc.local -> rc.d/rc.local
```

重新安装一次相同版本的 example-rpm-package-1.1-release90.el7.x86_64.rpm

```
sudo rpm -ivh example-rpm-package-1.1-release90.el7.x86_64.rpm
```

安装完成后检查可以看到`/etc/rc.local`被替换成实际文件，而不是软链接。而且可以看到rpm包修改的内容是作用于`/etc/rc.local`上，而不是正确的目标`/etc/rc.d/rc.local`

```
$ls -lh /etc/rc.local
-rwxr-xr-x 1 root root 863 Sep  5 00:03 /etc/rc.local
```

# `sed -i`默认不检查软链接！！！

原因是什么呢？检查这个rpm包的spec文件可以看到：

```
%post
...
#add turbo to rc.local
sed -i /myscript/d /etc/rc.local
echo "sh /usr/local/bin/myscript.sh" >> /etc/rc.local
```

在这个spec文件中，其他修改`rc.local`的sed命令都是直接修改`/etc/rc.d/rc.local`，但是上述`sed`指令错误修改软链接文件导致了`/etc/rc.local`到`/etc/rc.d/rc.local`的软链接被替换成实体文件：

* `sed`的`-i / --in-place`参数可以直接修改文件。但是，默认情况下，`sed`在读取文件之前不会检查文件是否是软链接，所以`sed`转换之后覆盖原文件（`sed`相当于将原文件通过流方式过滤改成，然后通过管道生成临时文件，然后删除掉原文件，再将临时文件重命名成原文件）。这就导致了如果原文件是一个软链接，就会在修改后转变成实体文件。
* GNU `sed` 提供了一个`--follow-symlinks`参数，可以检测修改的是软链接，而实现对软链接指向的实体文件的修改，避免破坏软链接。案例如下：

```
$ echo "cat" > pet
$ ln --symbolic pet pet_link
$ sed --in-place --follow-symlinks 's/cat/dog/' pet_link
$ cat pet
dog
```

# 参考

* [How do I prevent sed -i from destroying symlinks?](https://unix.stackexchange.com/questions/192012/how-do-i-prevent-sed-i-from-destroying-symlinks)
* [How to prevent sed -i command overwriting my symlinks on Linux or Unix](https://www.cyberciti.biz/faq/howto-prevent-sed-i-from-destroying-symlinks-on-linux-unix/)