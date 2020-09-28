运行容器的服务器每5分钟打印一次:

```
[Tue Sep 22 16:40:27 2020] new mount options do not match the existing superblock, will be ignored
[Tue Sep 22 16:45:28 2020] new mount options do not match the existing superblock, will be ignored
[Tue Sep 22 16:50:40 2020] new mount options do not match the existing superblock, will be ignored
```

这个报错是因为host主机的CGroup配置和容器试图挂载的Cgroup不一致导致的。例如容器内部采用操作系统是 CentOS 6，挂载cgroup v1，而主机是CentOS 7，挂载cgroup v2，可能有这样报错。这个问题我需要验证一下，目前从网上资料来看这个报错没有关系可以忽略。



# 参考

* [New mount options do not match the existing superblock, will be ignored](https://discuss.linuxcontainers.org/t/new-mount-options-do-not-match-the-existing-superblock-will-be-ignored/2485)
* [kernel: new mount options do not match the existing superblock, will be ignored #5857](https://github.com/containers/podman/issues/5857)