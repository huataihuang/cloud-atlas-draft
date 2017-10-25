> 本文是一个快速启动和使用容器的指南，以及对Dockerfile的初探，最后通过容器运行一个key-value存储案例。

# 第一个镜像

以下命令下载并运行一个debian镜像来验证测试Docker安装：

```bash
docker run debian echo "Hello World"
```

在执行`docker run`命令时，将启动容器。其中`debian`参数是镜像名称，指精简过的Debian Linux发行版。

此时会提示

```
Unable to find image 'debian:latest' locally
```

表明本地没有Debian镜像，此时Docker便会在 Docker Hub 进行在线搜索，并下载 Debian 最新版本的镜像。镜像下载后，Docker 会将它转成容器并运行，然后在容器中执行我们指定的命令——`echo "Hello World"`。

如果再次执行同一命令，那就无需再下载镜像了，容器会立即启动。执行 `echo` 命令，最后把容器关掉。

用以下命令，请求 Docker 提供一个容器中的 shell，在这个shell中，可以执行命令，类似ssh进入远程主机。这里`-i -t`参数表示需要附有tty的交互会话（interactive session），这里`/bin/bash`参数表示想获得一个bash shell。当退出shell时，容器就会停止 -- 反之，主进程（bash）运行多久，容器就运行多久。这也为我们在容器中运行daemon服务提供了途径。

```bash
[huatai@DevStudio ~]$ docker run -i -t debian /bin/bash
root@be4fe91c689c:/# echo "Hello docker!"
Hello docker!
root@be4fe91c689c:/# exit
exit
```

# 基本命令

* 运行容器时指定容器名字`--name <container_name>`和指定容器内部主机名`-h <hostname>`

docker支持对容器设置主机名（可以理解成启动容器之后，在容器内部执行了`hostname`指令），命令行参数时`-h`

```bash
docker run -h CONTAINER -i -t debian /bin/bash
```

执行案例：

```bash
[huatai@DevStudio ~]$ docker run -h CONTAINER -i -t debian /bin/bash
root@CONTAINER:/# hostname
CONTAINER
```

> 可以把docker容器的`-i -t 容器名 /bin/bash`指令理解成在主机上启动了一个chroot的shell进程，在这个环境中可以运行交互命令或者服务。在容器没有销毁之前，服务将始终可用。这就可以给每个服务隔离出一个完整的操作系统环境（除了内核不能修改），方便部署微服务。

此时在主机上执行`docker ps`可以检查当前运行的容器（要包含所有容器，即包含当前运行和停止状态的所有容器，则使用`docker ps -all`）

```
[huatai@DevStudio ~]$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
7cf906a4e705        debian              "/bin/bash"         32 minutes ago      Up 32 minutes                           wizardly_mestorf
```

> docker为容器生成的名称，是一个随机的形容词加上一个著名的科学家、工程师或者黑客的名字组成。除了自动生成，也可以使用`--name`参数来制定名称。例如`docker run --name boris debian echo "Boo"`

* 检查容器相关信息 - 使用`inspect`指令：

```bash
docker inspect wizardly_mestorf
```

则输出wizardly_mestorf容器的详细运行状态以及配置信息，如运行状态、主机配置等

```
[huatai@DevStudio ~]$ docker inspect wizardly_mestorf
[
    {
        "Id": "7cf906a4e70531fef5057727716d4762de69dd1a0a9f573be87acf821ce3601f",
        "Created": "2017-10-25T01:27:30.505351138Z",
        "Path": "/bin/bash",
        "Args": [],
        "State": {
            "Status": "running",
            "Running": true,
...                      
        "Image": "sha256:874e27b628fd79d9fa4c8072e8e5e0e7da6b26e699350b35aff00aaccff4e85d",               
        "ResolvConfPath": "/var/lib/docker/containers/7cf906a4e70531fef5057727716d4762de69dd1a0a9f573be87acf821ce3601f/resolv.conf",         
        "HostnamePath": 
...
```

例如，可以通过`grep IPAddress`命令检查IP地址

```
[huatai@DevStudio ~]$ docker inspect wizardly_mestorf | grep IPAddress
            "SecondaryIPAddresses": null,
            "IPAddress": "192.168.16.2",
                    "IPAddress": "192.168.16.2",
```

或者通过以下命令解析找到容器的IP地质

```
[huatai@DevStudio ~]$ docker inspect --format {{.NetworkSettings.IPAddress}} wizardly_mestorf
192.168.16.2
```

* 检查容器修改过的内容：`docker diff`指令

首先在容器交互shell中使用以下命令创建一个文件（然后来在主机上对比检查这个变化）

```
root@CONTAINER:/# echo "test_me" > /etc/test.conf
```

此时在主机上执行`docker diff`就可以知道容器中那些内容被修改过了：

```
[huatai@DevStudio ~]$ docker diff wizardly_mestorf
C /etc
A /etc/test.conf
```

> 可以在主机上检查容器中发生的变化

Docker 容器使用联合文件系统（union file system，UFS），它允许多个文件系统以层级方式挂载，并表现为一个单一的文件系统。镜像的文件系统以只读方式挂载，任何对运行中容器的改变则只会发生在它之上的可读写层。因此，Docker 只需查看最上面的可读写层，便可找出曾对运行系统所作的所有改变。

* 获取容器中执行过的所有命令`docker logs`

通过 `docker logs` 可以获取到在容器交互界面中执行过的所有命令以及对应的交互内容，相当于屏幕所有内容的记录，方便排查问题！

```
[huatai@DevStudio ~]$ docker logs wizardly_mestorf
root@CONTAINER:/# hostname
CONTAINER
root@CONTAINER:/# ifcon
bash: ifcon: command not found
root@CONTAINER:/# ip add list
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
4: eth0@if5: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:c0:a8:10:02 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 192.168.16.2/20 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:c0ff:fea8:1002/64 scope link 
       valid_lft forever preferred_lft forever
root@CONTAINER:/# ping 202.96.209.133
PING 202.96.209.133 (202.96.209.133): 56 data bytes
64 bytes from 202.96.209.133: icmp_seq=0 ttl=243 time=3.256 ms
64 bytes from 202.96.209.133: icmp_seq=1 ttl=243 time=3.319 ms
^C--- 202.96.209.133 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss
round-trip min/avg/max/stddev = 3.256/3.287/3.319/0.032 ms
root@CONTAINER:/# vi /etc/test.conf
bash: vi: command not found
root@CONTAINER:/# echo "test_me" > /etc/test.conf
```

* 销毁容器 - 从shell中退出就销毁了容器

```
root@CONTAINER:/# exit
exit
[huatai@DevStudio ~]$
```

由于 shell 是唯一一个在容器中运行的进程，容器也会同时停止。这时候如果执行 `docker ps`，会发现已经没有任何正在运行的容器了。

如果键入 `docker ps -a`，它会列出所有容器，包括已经停止的容器（官方说法是“已退出容器”，exited container）。已退出的容器可以用 `docker start` 重启。

* 删除容器 - `docker rm`

```
docker rm wizardly_mestorf
```

此时再次检查`docker ps -all`可以看到最近创建的一层`wizardly_mestorf`已经被删除，只剩下下一层的容器

```
[huatai@DevStudio ~]$ docker ps -all
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                    PORTS               NAMES
be4fe91c689c        debian              "/bin/bash"         11 hours ago        Exited (0) 11 hours ago                       stupefied_leavitt
```

如果想删除所有已停止的容器，可以利用 `docker ps -aq -f status=exited` 的结果，结果中包含所有已停止容器的 ID。

```
[huatai@DevStudio ~]$ docker ps -aq -f status=exited
be4fe91c689c
62d8e4b09c0f
```

要删除所有已经停止的容器，可以利用`docker ps -aq -f status=exited`的结果，结果中包含了所有已经停止容器的ID

```
docker rm -v $(docker ps -aq -f status=exited)
```

> 为了避免已停止的容器的数量不断增加，可以在执行 docker run 的时候加上 --rm 参数，它的作用是当容器退出时，容器和相关的文件系统会被一并删掉。

# 创建一个实际可工作的容器

> 以下创建一个可以实际工作并且按照常规运维方式维护的容器，命名为`stretch`

```
docker run -it --name stretch --hostname stretch debian /bin/bash
```

然后就可以在这个容器内执行一些维护工作。

以下是一些交互案例

```bash
[huatai@DevStudio ~]$ docker run -it --name stretch --hostname stretch debian /bin/bash
root@stretch:/# apt-get update
root@stretch:/# apt-get install -y screen wget bzip2 sysstat unzip nfs-common ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python
```

(可选)可以安装有趣的终端程序`cowsay`和`fortune`，玩笑一下：

```
root@stretch:/# apt-get install -y cowsay fortune
root@stretch:/# /usr/games/fortune | /usr/games/cowsay
```

* 将容器转换成镜像 `docker commit`- 容器如果转换成镜像就可以在后续docker运维中，使用自定义的镜像来不断clone出新的容器

> 转成镜像执行 `docker commit` 即可，无论容器是在运行中还是在停止状态都可以。

```
[huatai@DevStudio ~]$ docker commit stretch debian9/mini_init
sha256:0e0eb8fbc212ec3ccd4b8b71fdaa33b3e998afac1689a25d620a75414e321e9e
```

> 这样初始化完成了一个Debian 9.2的镜像制作

* 使用`docker images`可以检查主机具备的镜像

```
[huatai@DevStudio ~]$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
debian9/mini_init       latest              0e0eb8fbc212        31 seconds ago      571 MB
docker.io/debian    latest              874e27b628fd        2 weeks ago         100 MB
```

如果对创建的镜像名字不满意，例如这里命名的`debian9/mini_init`想重命名成`local/debian9`是通过`docker tag`命令来创建一个新的"标签"（相当于`git`命令），这样就能够生成完全一样的两个镜像。

```
[huatai@DevStudio ~]$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
debian9/mini_init   latest              0e0eb8fbc212        13 minutes ago      571 MB
docker.io/debian    latest              874e27b628fd        2 weeks ago         100 MB

[huatai@DevStudio ~]$ docker tag debian9/mini_init local/debian9

[huatai@DevStudio ~]$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
local/debian9       latest              0e0eb8fbc212        14 minutes ago      571 MB
debian9/mini_init   latest              0e0eb8fbc212        14 minutes ago      571 MB
docker.io/debian    latest              874e27b628fd        2 weeks ago         100 MB
```

然后可以删除掉不需要镜像`debian9/mini_init`

```
[huatai@DevStudio ~]$ docker rmi debian9/mini_init
Untagged: debian9/mini_init:latest

[huatai@DevStudio ~]$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
local/debian9       latest              0e0eb8fbc212        16 minutes ago      571 MB
docker.io/debian    latest              874e27b628fd        2 weeks ago         100 MB
```

* 现在运行一个新镜像`local/debian9`的容器，命名为`cowboy`

```
[huatai@DevStudio ~]$ docker run -it --name cowboy --hostname cowboy local/debian9 /bin/bash
root@cowsay:/#
```

完成上述测试后，释放这个`cowboy`容器：

```
docker rm cowboy
```

> 以上完成了一个镜像制作，但是存在的问题是：可重复性（repeatable）很差；创建镜像的步骤很难与他人分享，把步骤重做也不是件易事，而且容易出错。解决这些问题的方法就是利用 Dockerfile，使创建镜像的过程全部自动化。

# 通过Dockerfile创建镜像

Dockerfile 是一个描述如何创建 Docker 镜像所需步骤的文本文件。

现在通过Dockerfile来完成上述手工完成的操作

```
$ mkdir cowboy
$ cd cowboy/
$ touch Dockerfile
```

修改这个Dockerfile内容如下：

```
FROM debian:stretch

RUN apt-get update && apt-get install -y screen wget bzip2 sysstat unzip nfs-common ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python
```

> 这里`FROM debian:stretch`也可以改成`FROM debian:latest`表示取最新稳定版本

完成后在同一个目录下执行`docker build`命令

```
[huatai@DevStudio cowboy]$ docker build -t test/cowboy .
Sending build context to Docker daemon 2.048 kB
Step 1/2 : FROM debian:stretch
Trying to pull repository registry.fedoraproject.org/debian ... 
Trying to pull repository registry.access.redhat.com/debian ... 
Trying to pull repository docker.io/library/debian ... 
sha256:2e43e863a4ab6e53caf87a37d01d8c144cdcb732ad1b944fcf45cbfd7248a02a: Pulling from docker.io/library/debian
Digest: sha256:2e43e863a4ab6e53caf87a37d01d8c144cdcb732ad1b944fcf45cbfd7248a02a
Status: Image is up to date for docker.io/debian:stretch
 ---> 874e27b628fd
Step 2/2 : RUN apt-get update && apt-get install -y screen wget bzip2 sysstat unzip nfs-common ssh mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python
 ---> Running in a81519f24667
...
```

创建完成后，就可以运行这个镜像`test/cowboy`创建一个运行容器`debian9-dev`（这个镜像和前面手工创建的镜像`local/debian9`是完全一样的）

```
docker run -it --name debian9-dev --hostname debian9-dev test/cowboy /bin/bash
```

# Docker核心概念

* 联合文件系统（有时也称为"联合挂载"）

联合文件系统允许多个文件系统叠加，并表现为一个单一的文件系统。文件夹中的文件可以来自多个文件系统，但如果有两个文件的路径完全相同，最后挂载的文件则会覆盖较早前挂载的文件。Docker 支持多种不同的联合文件系统实现，包括AUFS、Overlay、devicemapper、BTRFS 及ZFS。

具体使用哪种实现取决于你所用的系统，可以通过 `docker info` 命令，查看输出结果中“Storage Driver”的值得知。

Docker 的镜像由多个不同的“层”（layer）组成，每一个层都是一个只读的文件系统。Dockerfile 里的每个指令都会创建一个新的层，而这个层将位于前一个层之上。当一个镜像被转化成一个容器时（譬如通过 docker run 或docker create 命令），Docker 引擎会在镜像之上添加一个处于最上层的可读写文件系统（同时还会对一些配置进行初始化，如 IP 地址、名称、ID，以及资源使用限制等）。

由于不必要的层会使镜像变得臃肿（而且 AUFS 最多只能有 127 个层），你会发现很多 Dockerfile 都把多个 UNIX 命令放在同一个 RUN 指令中，以减少层的数量。

容器可以处于以下几种状态之一：已创建（created）、重启中（restarting）、运行中（running）、已暂停（paused）和已退出（exited）:

* `已创建`指容器已通过 docker create 命令初始化，但未曾启动。
* `已退出`也称为`已停止`，指容器中没有正在运行的进程（虽然`已创建`状态的容器也没有正在运行的进程，但`已退出`的容器至少启动过一次）。
* `重启中`状态实际上很少遇见，当 Docker 引擎尝试重启一个启动失败的容器时，它才会出现。

> 容器的主进程退出时，容器也会退出。`已退出`的容器可以用 `docker start` 命令重启。已停止的容器不等于一个镜像，因为前者还会保留对配置、元数据和文件系统的改动。

# 镜像启动最后执行的指令

通过利用 Dockerfile 的 `ENTRYPOINT` 指令指定一个可执行文件，同时还能处理传给 `docker run` 的参数。

在Dockerfile所在的同一个目录下可以存放一个希望镜像最后运行的脚本，并且让镜像生成最后把脚本复制到镜像内部并运行

假设创建了`entrypoint.sh`脚本内容如下

```
#!/bin/bash
if [ $# -eq 0 ]; then
    /usr/games/fortune | /usr/games/cowsay
  else
    /usr/games/cowsay "$@"
fi
```

然后使用`chmod +x entrypoint.sh`设置为脚本可执行

修改Dockerfile添加如下

```
FROM debian:stretch

RUN apt-get update && apt-get install -y screen wget bzip2 sysstat unzip nfs-common ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python

COPY entrypoint.sh / .

ENTRYPOINT ["/entrypoint.sh"]
```

这样生成的镜像中就会包含这个脚本，并且可以通过传递参数让脚本产生不同的输出

```
docker build -t test/cowsay-dockerfile .
```

通过这个镜像可以提供参数或者不提供参数运行容器

```
$ docker run test/cowsay-dockerfile
```

```
$ docker run test/cowsay-dockerfile Hello Moo
```

# 使用寄存服务（Docker registry）

对于完成的镜像，如果需要分享，可以上传到官方Docker Hub提供他人下载。

Docker Hub 可以通过命令行或网页访问，你可以使用 Docker 的 search 命令，或者在 http://registry.hub.docker.com 上搜索已有的镜像。

* 寄存服务（registry）: 负责托管和发布镜像的服务，默认为 Docker Hub。
* 仓库（repository）: 一组相关镜像（通常是一个应用或服务的不同版本）的集合。
* 标签（tag）: 仓库中镜像的识别号，由英文和数字组成（如 14.04 或 stable）。

必须在 Docker Hub 上注册一个账户（通过网站或者 docker login 命令）。

注册完成后，只需为镜像指定一个合适名称的仓库和标签，然后用 docker push 命令上传到 Docker Hub。不过在上传之前，还要在 Dockerfile 内加入 MAINTAINER 指令，这样做是为了给镜像设定作者的联系信息：

```
FROM debian:stretch

MAINTAINER vincent huatai <vincent@huatai.me>

RUN apt-get update && apt-get install -y screen wget bzip2 sysstat unzip nfs-common ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python

COPY entrypoint.sh / .

ENTRYPOINT ["/entrypoint.sh"]
```

> 这里案例是根据「Docker开发指南」依样画葫芦的案例，仅供参考。

通过以下命令完成镜像`amount/cowsay`制作和上传（push）

```
docker build -t amount/cowsay .
docker push amount/cowsay
```

# 使用Redis官方镜像

> 本段案例创建一个redis的容器

* 获取redis镜像

```
docker pull redis
```

* 启动Redis容器，注意这里使用了参数`-d`表示容器在后台运行，不会把容器的输出打印出来，而只会返回容器 ID，然后就会退出。容器仍然在后台运行，通过 `docker logs` 命令查看容器的输出。

```
docker run --name myredis --hostname myredis -d redis
```

现在可以启动一个新的容器来运行`redis-cli`工具，并且把这个新的容器和前面启动的`myredis`容器连接起来（使用`--link`）

```
docker run --rm -it --name redis-cli --hostname redis-cli --link myredis:redis-cli redis /bin/bash
```

> 上面两条指令分别启动了两个基于redis镜像的容器，并且建立了网络连接。docker会在新容器`redis-cli`的配置中添加主机名解析（`/etc/hosts`配置文件），这样客户端就可以直接用`myredis`主机名来访问创建的redis服务器进行一些测试。

```
root@redis-cli:/data# redis-cli -h myredis -p 6379
myredis:6379> ping
PONG
myredis:6379> set "abc" 123
OK
myredis:6379> get "abc"
"123"
myredis:6379> exit
root@redis-cli:/data# exit
exit
```

# 数据持久化和共享

注意，容器和容器之间数据共享需要通过数据卷（volume）实现，也就是直接在主机上挂载的文件案或目录，不属于常规联合文件系统的一部分。这意味着它们允许与其他容器共享，而任何修改都会直接发生在主机的文件系统里。

> 在物理服务器上将磁盘文件系统共享给的多个容器，则可以实现文件交换。

声明一个目录为数据卷有两种方法：

* Dockerfile 里使用 `VOLUME` 指令

```
VOLUME /data
```

* 在执行 `docker run` 的时候使用 `-v` 参数。

```
docker run -v /data test/webserver
```

> 执行 docker run 命令的时候可以指定用于挂载的主机目录

```
docker run -d -v /host/dir:/container/dir test/webserver
```

# 备份Redis容器

假设上述`myredis`容器还在运行，并且也在上述案例中通过`redis-cli`容器向`myredis`容器中添加了一个`key:value`内容是`"abc":123`。则备份如下：

```
docker run --rm --volumes-from myredis -v $(pwd)/backup:/backup redis-cli cp /data/dump.rdb /backup/
```

> 这里通过`-v`参数挂载主机上的一个目录`当前目录/backup`，将运行容器