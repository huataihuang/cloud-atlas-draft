在主机操作系统重启之后自动重启Docker容器的方法是使用[restart policies](https://docs.docker.com/engine/reference/run/#/restart-policies---restart)，这个方法从Docker 1.2开始支持。可用只要容器存在，Docker就可以在服务启动后自动重启该容器：

```
sudo docker run --restart=always -d myimage
```

# 使用案例

重启策略使用`--restart`参数运行，即在创建容器时使用参数如下：

* `no` - 存在容器并不重启
* `on-failure` - 如果容器退出并且有一个非0的状态，则重启容器
* `always` - 不管退出状态如何总是重启容器

并且，可以指定重启容器的最大次数，不过，默认是永远重启容器

```
sudo docker run --restart=always redis
```

指定容器异常退出则重启容器，最大重启10次：

```
sudo docker run --restart=on-failure:10 redis
```

> 注意：这个设置最大重启次数只在`on-failure`策略使用时生效。

# 参考

* [How do I auto-start docker containers at system boot?](https://serverfault.com/questions/633067/how-do-i-auto-start-docker-containers-at-system-boot)