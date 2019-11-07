正如 [SSH端口转发](../../service/ssh/ssh_port_forwarding) 的应用场景 "ssh动态端口转发" :有时候我们不得不通过SOCKS代理方式来访问目标服务器。既然SSH Tunnel能够实现动态端口转发，也就是说git ssh也能够通过这个方式访问代码仓库。

配置方法是修改 `~/.ssh/config` 设置（测试成功）：

```
Host gitlab.example.com
  User huatai
  ProxyCommand nc -x localhost:2280 %h %p
```

或者使用(未测试成功)

```
Host gitlab.example.com
  User huatai
  ProxyCommand ssh -q localhost:2280 nc %h %p
```

> 注意，需要在本地安装一个 `nc` 工具（即OpeBSD版本的netcat)，然后就可以直接进行git仓库同步了。