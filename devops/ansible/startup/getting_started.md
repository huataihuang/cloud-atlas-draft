# 远程连接

从Ansible 1.3开始，默认使用原生的OpenSSH来和远程主机通讯。这种方式回激活`ControlPersist`（一种性能提升），`Kerberos`以及在`~/.ssh/config`中配置的`Jump Host`等设置。

> 有关`ControlPersist`，请参考[ssh多路传输multiplexing加速](../../../service/ssh/multiplexing.md)

然而，在RHEL 6操作系统中，由于OpenSSH版本过于陈旧，可能不支持`ControlPersist`。在这些操作系统，Ansible将使用名为`paramiko`Python实现的OpenSSH调用。如果需要实现类似Kerberized SSH等高级功能，考虑使用Fedora, OS X或Ubuntu等使用了新版本OpenSSH的操作系统。

> 在Ansible 1.2等旧版本，默认使用`paramiko`，原生SSH使用是通过`-c ssh`选项或者配置文件设置。

在远程主机通讯中，Ansible默认假定使用SSH key，可以用`--ask-pass`参数来使用密码认证方式，但建议使用密钥认证。

# 第一个命令

编辑（或创建）`/etc/ansible/hosts`文件来维护远程主机列表。这些系统中应该已经分发了`authorized_keys`

```bash
[exampleserver]
192.168.1.50
aserver.example.org
bserver.example.org
```

这是一个清单文件，详细请参考[清单](inventory.md)。注意，如果SSH访问主机使用特定身份，则需要再主机名后添加 `ansible_user=USERBANE` 设置。

为了能够不必每次都输入SSH key的保护密码，需要设置SSH agent:

```bash
ssh-agent bash
ssh-add ~/.ssh/id_rsa
```

> 详细有关ssh密钥技术和ssh agent使用方法，请参考[ssh密钥](../../../service/ssh/ssh_key.md)

现在开始测试访问所有的节点

```bash
ansible all -m ping
```

> 这里`-m ping`是使用ansible的SSH机制来测试远程主机的可访问性，并不是使用`ping`命令
>
> `all`表示`hosts`配置中所有主机

返回信息可以看到，`ansible`是使用`ssh`作为`ping`，然后看输出是否正确来显示`pong`。输出类似

```bash
192.168.1.2 | UNREACHABLE! => {
    "changed": false,
    "msg": "ERROR! SSH encountered an unknown error during the connection. We recommend you re-run the command using -vvvv, which will enable SSH debugging output to help diagnose the issue",
    "unreachable": true
}
192.168.1.3 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
192.168.1.1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

如果要使用指定用户帐号，例如`bruce`帐号，以及使用`bruce`用户帐号登录后再`sudo`成`root`用户，可以使用

```bash
# as bruce
$ ansible all -m ping -u bruce
# as bruce, sudoing to root
$ ansible all -m ping -u bruce --sudo
# as bruce, sudoing to batman
$ ansible all -m ping -u bruce --sudo --sudo-user batman

# With latest version of ansible `sudo` is deprecated so use become
# as bruce, sudoing to root
$ ansible all -m ping -u bruce -b
# as bruce, sudoing to batman
$ ansible all -m ping -u bruce -b --become-user batman
```

下面我们来测试一个简单的命令，向所有主机发送`uname -a`指令

```bash
ansible all -a "uname -a"
```

```bash
192.168.1.2 | UNREACHABLE! => {
    "changed": false,
    "msg": "ERROR! SSH encountered an unknown error during the connection. We recommend you re-run the command using -vvvv, which will enable SSH debugging output to help diagnose the issue",
    "unreachable": true
}
192.168.1.3 | SUCCESS | rc=0 >>
Linux host3.exmaple.com 2.6.32-504.16.2.el6.x86_64 #1 SMP Wed Apr 22 06:48:29 UTC 2015 x86_64 x86_64 x86_64 GNU/Linux

192.168.1.2 | SUCCESS | rc=0 >>
Linux host2.exmaple.com 2.6.32-220.el6.x86_64 #1 SMP Wed Nov 9 08:03:13 EST 2011 x86_64 x86_64 x86_64 GNU/Linux
```

# 主机key检查

Ansible 1.2.1以及更高版本默认启用了主机key检查。如果服务器重新安装，并且在`known_hosts`文件中有不同的key，就会导致错误消息。

如果希望禁止这个特性，可以在`/etc/ansible/ansible.cfg`或者`~/.ansible.cfg`中添加配置

```bash
[defaults]
host_key_checking = False
```

也可以通过设置环境变量来实现：

```bash
export ANSIBLE_HOST_KEY_CHECKING=False
```

