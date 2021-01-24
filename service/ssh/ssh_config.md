为了方便ssh使用，我们需要有一个类似DNS的解析配置`/etc/hosts`的配置文件，把需要访问的主机ssh配置记录到 `~/.ssh/config` ，举例如下

```bash
Host *
    ServerAliveInterval 60
    ControlMaster auto
    ControlPath ~/.ssh/%h-%p-%r
    ControlPersist yes
    StrictHostKeyChecking no
    #BatchMode yes
    #LocalForward 52698 127.0.0.1:52698

Host pi-master1
   HostName 192.168.6.11
   User ubuntu

Host centos8-ssh
   HostName 127.0.0.1
   Port 1222
   User admin
   ForwardX11 yes
```