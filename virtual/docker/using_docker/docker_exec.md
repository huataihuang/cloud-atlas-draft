`docker exec` 可以在一个运行中的容器中执行一个命令：

```bash
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

- 首先我们启动一个docker容器::

```
docker run --name ubuntu_bash --rm -i -t ubuntu bash
```

> 注意：这里案例中容器名字命名为 `ubuntu_bash`，后续引用这个容器名

- 通常我们要进入docker容器的shell中执行交互命令

```
docker exec -it ubuntu_bash bash
```

或者

```
docker exec -it ubuntu_bash -- /bin/bash
```

- 可以在执行shell中设置环境变量：

```
docker exec -it -e VAR=1 ubuntu_bash bash
```

> 注意：这里的环境变量 `$VAR` 设置为 `1` ，且这个环境变量仅在当前bash会话有效。

- 还可以选择命令执行的工作目录:

```
docker exec -it -w /root ubuntu_bash pwd
```

- 在容器中执行一个后台非交互的命令，使用  `-d` 参数表示 `detach mode` ，在后台运行命令:

```
docker exec -d ubuntu_bash touch /tmp/execWorks
```

> 注意：传递给容器执行的命令不要使用 `""` 括起，使用引号括起，就会被完整作为一个命令传递个容器，此时容器中就会找不到这个命令，而出现文件不存在报错。例如，想要创建一个临时空文件，应该使用：

```
docker exec -it ubuntu_bash touch /tmp/execWorks
```

而不是使用

```
docker exec -it ubuntu_bash "touch /tmp/execWorks"
```

使用了引号时，会提示报错：

```
exec failed: container_linux.go:251: starting container process caused \"exec: \\\"touch /tmp/execWorks\\\": stat touch /tmp/test: no such file or directory
```

# 清空容器中日志文件

遇到一个麻烦的问题，我执行

```
docker exec -it ubuntu_bash echo "" > /tmp/execWorks
```

发现实际上清空的命令并没有在容器中运行，反而清空了本地物理主机上的 `/etc/execWorks` 文件，原因是shell把 `> /tmp/execWorks` 解释为在本地主机上执行，而不是传递给远程的Docker容器中执行。

要将一系列命令使用shell包装成单一命令，例如：

```
docker exec -it CONTAINER_ID bash -c "mydocker_sql /usr/share/zoneinfo | mysql mysql"
```

上述结合多个命令的方法也可以参考 [docker run <IMAGE> <MULTIPLE COMMANDS>](https://stackoverflow.com/questions/28490874/docker-run-image-multiple-commands) 在创建启动容器是运行：

```
docker run image_name /bin/bash -c "cd /path/to/somewhere; python a.py"

docker run image_name /bin/bash -c "cd /path/to/somewhere && python a.py"
```

所以，我尝试了一下以下命令：

```
docker exec -it ubuntu_bash sh -c 'echo "" > /tmp/execWorks'
```

但是，我在 kubernetes 中测试发现报错:

```
kubectl exec -ti myapp-668677b895-59lt9 bash -c "> /tmp/xxx"
```

报错显示：

```
Error from server (BadRequest): container echo "" > /tmp/execWorks is not valid for pod myapp-5f976dffc5-k8jb9
```

好像kubernetes和docker还是对shell处理还是有些差别，我发现即使使用 `|` 也会出现报错，例如:

```
kubectl exec -ti myapp-668677b895-59lt9 bash -c "echo '' | tee /tmp/xxx"
```

同样报错

```
Error from server (BadRequest): container echo '' | tee /tmp/xxx.log is not valid for pod myapp-668677b895-59lt9
```

我突然明白了，原因是 kubernetes 对于pod中有多个container的情况，是将 `-c` 参数作为容器的意思，也就是 `-c ....` 被 kubernetes 解析成 pod `myapp-5f976dffc5-k8jb9` 中的某个容器了，根本没有传递给docker运行。

参考 [Get a Shell to a Running Container](https://kubernetes.io/docs/tasks/debug-application-cluster/get-shell-running-container/) ：

> Note: The double dash symbol “–” is used to separate the arguments you want to pass to the command from the kubectl arguments.

原来，很多时候 `kubectl` 命令中多了 `--` 不是没有道理的，这两个破折号表示后面的参数绕过kubectl，所以正确的方法：

```
kubectl exec -ti myapp-668677b895-59lt9 -- bash -c "echo '' | tee /tmp/xxx"
```

> 注意：我验证了，必须使用一个容器中的命令，如 `echo` ，不能直接用shell中的重定向符号来清理容器中的文件内容。例如，常常在shell脚本中使用的 `> /tmp/xxx` 是不能用于kubectl传递给容器的，会出现报错：

```
error: you must specify at least one command for the container
```

## 日志解决方案（待实践）

参考 [How to clean Docker container logs?](https://stackoverflow.com/questions/41091634/how-to-clean-docker-container-logs) ：

检查docker日志的方法：

```
docker logs --since 30s -f <container_name_or_id>
```

或者限制输出行数:

```
docker logs --tail 20 -f <container_name_or_id>
```

要删除Docker的日志，运行:

```
echo "" > $(docker inspect --format='{{.LogPath}}' <container_name_or_id>)
```

但是不建议这样操作，因为如果docker正好在写相同文件的日志时，如果使用上述命令清理日志会损坏日志文件，因为上述清理日志实际上不是在容器内部进行，而是在物理主机上找到对应的日志文件清理，脱离了容器操作会潜在导致冲突。

建议采用docker自动的轮转日志方式，即配置 `/etc/docker/daemon.json` 文件:

```json
{
  "log-driver": "json-file",
  "log-opts": {"max-size": "10m", "max-file": "3"}
}
```

注意：上述配置需要重启docker服务，并且容器需要新创建才生效。

对于kubernetes，应该采用sidecar来处理日志，好像不是直接操作pod中日志，请参考 [Logging Architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/)

而正确对待docker容器日志的方法，应该参考Docker官方的 [Configure logging drivers](https://docs.docker.com/config/containers/logging/configure/)

# 参考

* [docker exec](https://docs.docker.com/engine/reference/commandline/exec/)