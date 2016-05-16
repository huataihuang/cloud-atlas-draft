在执行`ansible-playbook example.yml`时候，总是提示`paramiko: The authenticity of host 'XXXX' can't be established.`

```bash
paramiko: The authenticity of host '192.168.1.1' can't be established.
The ssh-rsa key fingerprint is eff0743134e86397485685c5c9d84b8e.
Are you sure you want to continue connecting (yes/no)?
```

比较奇怪的是，其实这台主机是可以ssh登录的，并且已经ssh可以正常登录（并没有提示需要确认主机key）：检查可以看到`/etc/ssh/ssh_config`配置了

```bash
StrictHostKeyChecking no
UserKnownHostsFile /dev/null
```

所以`ssh HOST`时候不会报错（即不校验host key）。

但是`paramiko`是不使用`/etc/ssh_config`配置，导致ansible还是要校验host key。

参考 [Host Key Checking](http://docs.ansible.com/ansible/intro_getting_started.html#host-key-checking)，我们可以在 `/etc/ansible/ansible.cfg`或`~/.ansible.cfg`添加

```bash
[defaults]
host_key_checking = False
```

或

```bash
export ANSIBLE_HOST_KEY_CHECKING=False
```