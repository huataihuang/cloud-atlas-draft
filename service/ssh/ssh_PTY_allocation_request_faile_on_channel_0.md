遇到ssh登陆服务器报错:

```
PTY allocation request failed on channel 0
```

然后卡在这里不返回本地终端。

但是，非常奇怪的是，同样的主机，使用 ``pgm`` 命令（也就是pssh的改版) 却能够正常显示输出

```
#pgm -bf em14-gray_pouch_ip "uptime"
[1] 19:32:03 [SUCCESS] 11.189.100.52
 19:32:02 up 247 days, 19:24,  0 users,  load average: 1.67, 1.71, 1.41

[2] 19:32:03 [SUCCESS] 11.144.93.216
 19:32:02 up 360 days,  2:53,  0 users,  load average: 2.17, 2.48, 2.63
```

我怀疑和客户端的环境有关，因为客户端在docker容器中运行。