Docker容器需要Linux内核来运行，在macOS系统中，是通过运行一个 xhyve hyperviosr 上的小型Linux虚拟机操作系统来实现的。

如果你需要进入虚拟机，然后在虚拟机内部能够通过观察容器，可以尝试采用以下方法（不过我没有成功 screen 步骤，暂时记录待后续参考）

- 首先活的容器底层镜像文件系统

```bash
docker inspect --format='{{.GraphDriver.Data.UpperDir}}' <container>
```

- 切换到Linux VM（这步我没有成功)

```bash
screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty
```

- 然后就可以 `cd` 到前面通过 `docker inspect` 查询到到容器目录

# 参考

* [Enter Docker VM on MacOS Catalina (SSH, xhyve)](https://ekartco.com/2019/12/enter-docker-vm-on-macos-catalina-ssh-xhyve/)