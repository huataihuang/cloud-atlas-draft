默认情况下，`ansible`需要接受服务器的SSH fingerprint到`known_hosts`才能访问，并且由于`ansible`没有使用系统的`ssh`客户端，所以并不会因为`/etc/ssh/ssh_config`中设置了以下配置就不校验SSH服务器

```bash
StrictHostKeyChecking no
UserKnownHostsFile /dev/null
```

解决的方法是先使用`ssh-keyscan`扫描主机将host fingerprint添加

```bash
for i in $(cat hostnames.txt)
do
ssh-keyscan $i >> ~/.ssh/known_hosts
done
```

另一种方法是设置环境变量`ANSIBLE_HOST_KEY_CHECKING=False`

```bash
export ANSIBLE_HOST_KEY_CHECKING=False
ansible-playbook -i host_ip_list ansible_example_playbook.yaml
```

> 高版本`ansible`还可以使用`-e 'host_key_checking=False'`，例如

```bash
ansible-playbook -e 'host_key_checking=False' -i host_ip_list ansible_example_playbook.yaml
```

或者在配置文件 `/etc/ansible/ansible.cfg` or `~/.ansible.cfg` 中设置

```bash
[defaults]
host_key_checking = False
```

# 参考

* [How to set host_key_checking=false in ansible inventory file?](http://stackoverflow.com/questions/23074412/how-to-set-host-key-checking-false-in-ansible-inventory-file)
* [Install Ansible, Create Your Inventory File, and Run an Ansible Playbook and Some Ansible Commands](https://thornelabs.net/2014/03/08/install-ansible-create-your-inventory-file-and-run-an-ansible-playbook-and-some-ansible-commands.html)