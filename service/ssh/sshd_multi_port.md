有时候也需要让SSH服务器能够监听多个端口对外提供服务，或者修改sshd的监听端口。这个实现都是通过修改 `/etc/ssh/sshd_config` 来实现的：

```
Port 22
Port 222
```

然后重启sshd

```
sudo systemctl restart sshd
```

# 参考

* [Configuration for multiple port SSH](https://serverfault.com/questions/284566/configuration-for-multiple-port-ssh)