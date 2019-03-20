当使用 `docker logs <containername>` 方法检查容器日志时候，就会发现日志实在太多导致无法查看。

虽然Docker官方文档说docker日志是输出到 `STDOUT` 和 `STDERR` ，但是我尝试重定向日志还是失败:

> 假设这里的容器名字是 `mycontainer`

```
docker logs mycontainer 2>&1 > mycontainer.log
```

实际上可以直接检查容器日志文件，首先查看容器日志在哪里：

```
docker inspect --format='{{.LogPath}}' mycontainer
```

可以看看到容器日志是 `/var/lib/docker/containers/6807413c514e8a401f60e4581d80b64a84afefd023e3fd2faf30009ce2eb6a0e/6807413c514e8a401f60e4581d80b64a84afefd023e3fd2faf30009ce2eb6a0e-json.log`

另外，也可以实时检查日志

```
tail -f `docker inspect --format='{{.LogPath}}' mycontainer
```

# 参考

* [how to redirect docker logs to a single file?](https://stackoverflow.com/questions/41144589/how-to-redirect-docker-logs-to-a-single-file/41147654#41147654)