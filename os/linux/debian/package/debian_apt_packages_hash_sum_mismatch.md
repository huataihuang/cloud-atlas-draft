在使用`apt-get update`更新Debian系统时候，由于网络原因导致数据包下载损坏，会反复提示类似如下错误信息

```
Reading package lists... Done
E: Failed to fetch store:/var/lib/apt/lists/partial/deb.debian.org_debian_dists_stretch_main_binary-amd64_Packages.gz  Hash Sum mismatch
...
```

解决方法：

```
apt-get clean
rm -rf /var/lib/apt/lists/*
apt-get clean
apt-get update
apt-get upgrade
```

# 参考

* [debian apt packages hash sum mismatch](https://stackoverflow.com/questions/15505775/debian-apt-packages-hash-sum-mismatch)