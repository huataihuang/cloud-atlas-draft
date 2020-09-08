在脚本中经常会需要获得 `eth0` 的IP地址，以下是获取案例：

```bash
#!/bin/bash
ifconfig eth0 | grep "inet addr" | cut -d ':' -f 2 | cut -d ' ' -f 1
```

命令行：

```bash
ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
```

脚本：

```bash
#!/bin/bash
theIPaddress=$(ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)
```

# 参考

* [Displaying IP address on eth0 interface](https://askubuntu.com/questions/560412/displaying-ip-address-on-eth0-interface)