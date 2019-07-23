
* 安装Docker环境

```bash
# 安装必要软件包
yum install yum-utils device-mapper-persistent-data lvm2

# 添加Docker仓库，注意必须是Docker-CE
yum-config-manager \
  --add-repo \
  https://download.docker.com/linux/centos/docker-ce.repo
# 安装Docker CE
yum update && yum install docker-ce
```

* 设置Docker的配置

```bash
# 默认安装 /etc/docker 目录不存在，需要创建
mkdir /etc/docker

# 设置Daemon
cat > /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
EOF

mkdir -p /etc/systemd/system/docker.service.d
```

* 重启Docker服务

```bash
# Restart Docker
systemctl daemon-reload
systemctl restart docker
```

# docker启动异常排查

* 我遇到了docker启动报错

```
#systemctl status docker
● docker.service - Docker Application Container Engine
   Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled; vendor preset: disabled)
   Active: failed (Result: start-limit) since Tue 2019-07-23 17:17:44 CST; 2h 1min ago
     Docs: https://docs.docker.com
  Process: 16332 ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock (code=exited, status=1/FAILURE)
 Main PID: 16332 (code=exited, status=1/FAILURE)

Jul 23 17:17:42 worker4.huatai.me systemd[1]: docker.service failed.
Jul 23 17:17:44 worker4.huatai.me systemd[1]: docker.service holdoff time over, scheduling restart.
Jul 23 17:17:44 worker4.huatai.me systemd[1]: Stopped Docker Application Container Engine.
Jul 23 17:17:44 worker4.huatai.me systemd[1]: start request repeated too quickly for docker.service
Jul 23 17:17:44 worker4.huatai.me systemd[1]: Failed to start Docker Application Container Engine.
Jul 23 17:17:44 worker4.huatai.me systemd[1]: Unit docker.service entered failed state.
Jul 23 17:17:44 worker4.huatai.me systemd[1]: docker.service failed.
Jul 23 17:18:27 worker4.huatai.me systemd[1]: start request repeated too quickly for docker.service
Jul 23 17:18:27 worker4.huatai.me systemd[1]: Failed to start Docker Application Container Engine.
Jul 23 17:18:27 worker4.huatai.me systemd[1]: docker.service failed.
```

通过 `journalctl -xe` 可以看到启动日志是由于初始化 network controller 错误导致

```
Jul 23 20:16:17 worker4.huatai.me dockerd[16518]: failed to start daemon: Error initializing network controller: list bridge addresses failed: PredefinedLocalScopeDefaultNetworks List: [172.17.0.0/16 172.18.0.0/16 172.19.0.0/16 172.20.0.0/1
Jul 23 20:16:17 worker4.huatai.me dockerd[16518]: time="2019-07-23T20:16:17.337655189+08:00" level=info msg="stopping event stream following graceful shutdown" error="context canceled" module=libcontainerd namespace=plugins.moby
Jul 23 20:16:17 worker4.huatai.me systemd[1]: docker.service: main process exited, code=exited, status=1/FAILURE
Jul 23 20:16:17 worker4.huatai.me systemd[1]: Failed to start Docker Application Container Engine.
```

果然，使用 `ip addr` 看不到熟悉的 `docker0` 网桥。

参考 [ Error starting daemon: Error initializing network controller: list bridge addresses failed: no available network #123 ](https://github.com/docker/for-linux/issues/123#issuecomment-346546953) 解决：

```bash
ip link add name docker0 type bridge
ip addr add dev docker0 172.17.0.1/16
```

然后就可以正常启动docker服务

# 参考

* [Container runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)
* [ Error starting daemon: Error initializing network controller: list bridge addresses failed: no available network #123 ](https://github.com/docker/for-linux/issues/123#issuecomment-346546953)