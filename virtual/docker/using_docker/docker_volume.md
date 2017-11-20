Docker推荐使用卷(Volumes)来作为容器持久化数据存储方案。

虽然[bind mounts](https://docs.docker.com/engine/admin/volumes/bind-mounts/)依赖host主机的目录结构，但是volumes是完全由Docker管理的。

Volumes具有以下优点（优于bind mounts）：

* 卷容易备份或迁移
* 可以通过Docker CLI命令或者Docker API来管理卷
* 卷可以在Linux和Windows上通用
* 卷可以在多个容器间共享
* 卷的驱动允许将卷保存在远程主机或者云服务商，加密卷的内容或者增加其他功能
* 一个新卷的内容可以由一个容器进行预迁移（pre-populated by a container）

![Docker卷持久化](../../../img/virtual/docker/using_docker/types-of-mounts-volume.png)

# 实战

* 在host主机上创建`share-data`卷

```
docker volume create share-data
```

* 检查卷

```
docker volume inspect share-data
```

显示输出

```json
[
    {
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/share-data/_data",
        "Name": "share-data",
        "Options": {},
        "Scope": "local"
    }
]
```

* 使用`-v <volume_name>:/<container_path>`来映射卷给容器使用

```
docker run -it -p 22 -p 8000:8000 --memory=512M --cpus="1.5" --hostname dev5 --name dev5 \
-v share-data:/data local:dev5_django /bin/bash
```

> `local:dev5_django`本地的镜像
>
> `--memory=512M --cpus="1.5"`设置容器的cpu和内存资源
>
> `-p 22 -p 8005:8000`容器端口映射

# 参考

* [docker docs: Use volumes](https://docs.docker.com/engine/admin/volumes/volumes/)