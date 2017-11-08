在[使用Docker快速部署不同版本CentOS容器](virtual/docker/using_docker/docker_run_centos_container.md)后，就可以在容器中部署服务。例如，[部署Django REST framework](../../../develop/python/django/rest_framework/django_rest_framework_quickstart)，然后就需要将容器内部的服务端口映射成host主机的对外IP上的端口，以便能够通过外部访问。

* 在容器内部启动Django服务，注意，启动Django服务时需要监听所有端口，所以要添加`0.0.0.0:8000`参数

```
python manage.py runserver 0.0.0.0:8000
```

# 使用docker内建的运行命令实现端口映射

docker容器在运行时就提供了端口映射功能：

举例

```
docker run -d -p 8005:8000 --name vnc1 myvnc
```

如果要将已经部署的容器端口映射出去，可以先制作镜像快照，然后再次启动，在启动时传递端口

> 参考[Exposing a port on a live Docker container](https://stackoverflow.com/questions/19897743/exposing-a-port-on-a-live-docker-container)

```
sudo docker commit <containerid> <foo/live>
sudo docker run -i -p 22 -p 8005:8000 -m /data:/data -t <foo/live> /bin/bash
```

实际操作记录：

```
docker commit dev5 local:dev5_django
docker stop dev5
docker rm dev5

docker volume create share-data

docker run -it -p 22 -p 8005:8000 --memory=512M --cpus="1.5" --hostname dev5 --name dev5 \
-v share-data:/data local:dev5_django /bin/bash
```

> 通过`dev5`创建了镜像`local:dev5_django`，然后删除掉容器，再用镜像启动新的容器实现端口映射
>
> 创建了卷`share-data`共享给容器使用 - 详细清参考[Docker卷](docker_volume)

----

`以下iptables操作未实践成功，仅供参考`

----

# 使用iptables实现端口映射

`注意`：**不建议使用iptables来实现端口映射**，虽然在docker早期版本可能可以实现，但是在近期的高版本中可能不能正常工作。并且docker创建容器可能会动态分配不同的IP地址，导致端口映射失败。

> 在host主机上需要先测试一下是否能够访问容器中的django服务端口，可以采用`telnet 172.17.0.5 8000`

> 注意：默认的docker网络是NAT模式，连接在`docker0`这个虚拟交换机上

```
$ brctl show
bridge name     bridge id               STP enabled     interfaces
docker0         8000.024237c73b49       no              veth651d018
                                                        veth836c8aa
                                                        vetha0e4fcc
                                                        vetha23326f
                                                        vethc39f47b
                                                        vethfbf445a
```

通过将容器中端口输出到host主机上，可以提供对外服务。这个步骤是通过`iptables`实现：

* 检查容器`my_container`的IP地址

先检查`my_container`容器是否在运行中

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
d92a4a992fc2        local:centos5       "/bin/bash"         7 days ago          Up 7 days                               my_container
```

检查容器的IP地址是通过`docker inspect`指令

```
$ docker inspect my_container | grep IPAddress
            "SecondaryIPAddresses": null,
            "IPAddress": "172.17.0.5",
                    "IPAddress": "172.17.0.5",
```

> 这里可以看到该容器的IP地址是`172.17.0.5`，现在要将该容器中运行的`django`服务端口`8000`映射到host主机上

* host主机：添加映射规则

```
sudo iptables -t nat -A DOCKER -p tcp --dport 8005 -j DNAT --to-destination 172.17.0.5:8000
```

> `nat`这个`iptables`链表是Docker安装后默认添加

如果要删除这条添加的规则，则将`-A DOCKER`改成`-D DOCKER`执行就可以，即执行`sudo iptables -t nat -D DOCKER -p tcp --dport 8005 -j DNAT --to-destination 172.17.0.5:8000`

> 参考[How To List and Delete Iptables Firewall Rules](https://www.digitalocean.com/community/tutorials/how-to-list-and-delete-iptables-firewall-rules)

* host主机：添加外部访问host主机的端口允许（默认在host主机上启用的防火墙屏蔽了外部访问）

```
sudo iptables -I INPUT -p tcp --dport 8005 -j ACCEPT
```

> 删除规则`sudo iptables -D INPUT -p tcp --dport 8005 -j ACCEPT`

* 如果要持久化保存

```
sudo service iptables save
```

# 参考

* [Exposing a port on a live Docker container](https://stackoverflow.com/questions/19897743/exposing-a-port-on-a-live-docker-container)
* [A Brief Primer on Docker Networking Rules: EXPOSE, -p, -P, --link](https://www.ctl.io/developers/blog/post/docker-networking-rules/)