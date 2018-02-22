Docker容器的分发通常通过Docker Hub，也就是中心化的镜像上传和下载，适合数据中心管理方式。但是对于个人开发者，简简单单在两台主机间复制镜像则更为常见，此时使用Docker的export和import功能。

# 容器迁移

> 以下案例将主机A上的容器`myapp-server`迁移到主机B

* 在原主机A上检查容器

```
docker ps
```

显示容器

```
CONTAINER ID        IMAGE                          COMMAND                  CREATED             STATUS              PORTS                             NAMES
dcaa24ba7c62        local:myapp-server_django-dev   "/bin/bash"              3 months ago        Up 7 weeks          8000/tcp, 0.0.0.0:32768->22/tcp   myapp-server
```

* 输出容器

```
docker export myapp-server | gzip > myapp-server.gz
```

> 这里`myapp-server`是运行的容器名字

* 将镜像复制到主机B，然后执行以下命令导入

```
zcat myapp-server.gz | docker import - myapp-server
```

此时在主机B上检查镜像`docker images`可以看到

```
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
myapp-server         latest              e9c442f58421        36 minutes ago      2.13 GB
```

* 在主机B上运行容器只需要以下命令

```
docker run -i -t myapp-server /bin/bash
```

# 存储卷迁移

* 原先在主机A上，容器`myapp-server`有一个存储卷`share-data`，是多个Docker容器共享的存储卷，需要从主机A迁移到主机B以便完整实现数据同步：

以下是在主机A上检查显示

```
$ docker volume ls
DRIVER              VOLUME NAME
local               share-data
```

注意：这个`share-data`卷在容器中映射目录是`data`:

```
docker inspect myapp-server
```

显示卷如下

```
        "Mounts": [
            {
                "Type": "volume",
                "Name": "share-data",
                "Source": "/var/lib/docker/volumes/share-data/_data",
                "Destination": "/data",
                "Driver": "local",
                "Mode": "z",
                "RW": true,
                "Propagation": ""
            }
        ],
```

> [How to port data-only volumes from one host to another?](https://stackoverflow.com/questions/21597463/how-to-port-data-only-volumes-from-one-host-to-another)介绍了Docker官方文档[Backup, restore, or migrate data volumes](https://docs.docker.com/v17.03/engine/tutorials/dockervolumes/#backup-restore-or-migrate-data-volumes)的解决方法：`--volumes-from`参数可以创建新的容器来挂载卷。

* 在主机A上备份卷：

```
docker run --rm --volumes-from myapp-server -v $(pwd):/backup busybox tar cvfz /backup/data.tar.gz /data
```

> 参数解释
>
> * `--rm` 当退出时移除容器
> * `--volumes-from myapp-server` 将容器`myapp-server`的卷连接到本次命令启动的新容器上（用于读取数据）。这个卷的设置会和原先`myapp-server`完全相同，也是`share-data`卷映射到容器内的`/data`目录
> * `-v $(pwd):/backup` 将主机A的当前目录映射成容器内的`/backup`目录，这样在容器中执行的命令`tar cvfz /backup/backup.tar.gz /data`就会把文件`backup.tar.gz`实际存储到主机A的当前目录下
> * `busybox` 是一个非常小巧简单的镜像
> * `tar cvfz /backup/backup.tar.gz /data` 创建一个容器中目录`/data`的备份 （注意：这里使用了`tar cvfz`命令，其中`-v`参数是详细的输出信息，如果不需要屏幕输出备份了那些文件，可以去除`-v`参数）

* 将主机A的备份文件`data.tar.gz`复制到主机B上

* 在主机B上创建新的容器`DATA2`，并且卷`share-data`附加到这个用于回复数据的临时容器中 - 请参考[Docker卷](docker_volume)原先的操作步骤

```
docker volume create share-data
docker create -v share-data:/data --name DATA2 busybox true
```

上述步骤完成后，实际上`DATA2`这个容器就是我们用来转移回复的桥梁容器了。

* 在主机B上启动`DATA2`容器并执行命令恢复数据

```
docker run --rm --volumes-from DATA2 -v $(pwd):/backup busybox tar xfz /backup/data.tar.gz data/
```

* 在主机B上正式创建容器`myapp-server`并挂载共享的存储卷

```
docker run -it -p 22 -p 8000:8000 --hostname myapp-server --name myapp-server \
-v share-data:/data myapp-server /bin/bash
```

此时在主机B上就可以看到进入了容器`myapp-server`，对比检查系统内容可以看到完全和原先在主机A上相同。

# 参考

* [How to export and import containers with Docker](https://www.techrepublic.com/article/how-to-exportimport-containers-with-docker/)
* [Move Docker containers to other computer](https://github.com/wekan/wekan/wiki/Move-Docker-containers-to-other-computer)
* [How to port data-only volumes from one host to another?](https://stackoverflow.com/questions/21597463/how-to-port-data-only-volumes-from-one-host-to-another)