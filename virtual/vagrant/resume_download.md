在新增`bento/centos-6.7`时（`vagrant up`），由于网络不佳，终止了当前下载进程，遇到了一些小麻烦。

```bash
mkdir centos-6.7
cd centos-6.7
vagrant init bento/centos-6.7
vagrant up
```

下载过程中按过`ctrl-c`终止过，导致遗留了文件。Vagrant会尝试断点续传，但是遇到http服务器不支持断点续传，就会出现以下报错

```bash
An error occurred while downloading the remote file. The error
message, if any, is reproduced below. Please fix this error and try
again.

HTTP server doesn't seem to support byte ranges. Cannot resume.
```

解决方法参考 [vagrant up fails after aborted download](https://github.com/mitchellh/vagrant/issues/4479)

就是进入 `~/.vagrant.d/tmp` 目录删除以前下载的内容，然后重新开始

> 注意：如果并行安装下载，这个目录包含了多个子目录，需要小心处理对应的虚拟机目录