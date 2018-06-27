> 本文的方法适合将本地文件内容复制到远程文件中，原理是通过ssh建立加密通道，然后通过管道实现数据的输入和输出。

这里有一个案例，是因为当前用户对于`/var/lib/libvirt/images`目录没有读取权限，但是这个用户有`sudo`权限可以读取文件。需要将文件复制到远程服务器上进行备份，这里就出现了一个矛盾的情况：

* 如果使用`sudo`读取文件，则使用`scp`时会默认使用`root`用户的密钥。但是只有当前用户的密钥可以无需密码登陆远程服务器，切换到root用户则不行。
* 如果不使用`sudo`则虽然密钥正确，但是无法读取源文件。

> 这里只是提供一个解决思路，其实`scp`也可以指定使用的密钥，也就是即使使用`sudo scp`依然可以通过参数`-i identity_file`来使用当前用户正确的私钥。当然，还能够修改目录的权限或文件的权限等等。

这里可以采用的一种方法是使用管道符，

```
sudo cat win10.iso | ssh pi@192.168.0.11 "cat > /data_local/software/windows/win10.iso"
```

上述命令通过`sudo cat`实现了读取源文件，然后通过管道符输出给`ssh`，再在远程服务器上通过重定向符`>`写入到指定文件。这种方式实现了远程文件复制。

完成后，在本地和远程服务器上使用`md5sum win10.iso`对比文件MD5值，确认文件复制成功。

# 参考

* [How to remotely write to a file using SSH](https://superuser.com/questions/400714/how-to-remotely-write-to-a-file-using-ssh)