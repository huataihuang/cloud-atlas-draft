`pssh`是一个并行处理ssh命令的工具，在维护集群时非常高效。

# 常用参数

* `-h` - 从主机配置文件读取每个服务器的登陆配置（`用户名@主机:端口`）

```
  -h HOST_FILE, --hosts=HOST_FILE
                        hosts file (each line "[user@]host[:port]")
```

* `-i` - 合并每个服务器的输出和错误，常用于终端观察ssh执行结果

```
  -i, --inline          inline aggregated output and error for each server
```

* `-l` - 登陆用户账号名：例如，配置文件`vm`中只包含主机ip地址，系统在`pssh`交互时输入登陆账号名

* `-A` - 提供输入账号密码的交互，所有主机登陆统一使用一个密码

举例：

```
pssh -A -l root -ih vm "hostname"
```

# 使用ssh参数

`pssh`可以兼容继承ssh的参数，即可以将ssh的参数同样移植到pssh上，这对脚本编写带来非常大的兼容性和方便：

```
  -O OPTION, --option=OPTION
                        SSH option (OPTIONAL)
```

例如；希望自动接受服务器端的`fingerprint`

```
pssh -A -O StrictHostKeyChecking=no -l root -ih vm "hostname"
```

> `StrictHostKeyChecking`是检查主机的`fingerprint`，设置为`no`则不检查自动将主机`fingerprint`保存到`~/.ssh/known_hosts`文件中（不再提示检查）。