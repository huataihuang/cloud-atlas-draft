在使用ansible的时候，常常有一些有共性的配置每次通过环境变量或者参数传递（例如[关闭ssh服务器fingerprint检查](host_key_checking_false.md)）是非常麻烦的，可以通过`ansible.cfg`配置文件来设置。

Ansible按照如下位置和顺序查找`ansible.cfg`文件：

* `ANSIBLE_CONFIG`环境变量指定的文件
* `./ansible.cfg`（当前目录下的`ansible.cfg`）
* `~/.ansible.cfg`（主目录下的`.ansible.cfg`）
* `/etc/ansible/ansible.cfg`

通常可以将`ansible.cfg`和`playbooks`一起当前目录，这样就可以把`playbooks`提交的同一个版本控制仓库中

`ansible.cfg`案例：

```bash
[defaults]
hostfile = hosts
remote_user = admin
private_key_file = /home/admin/.ssh/ansible_private_key
host_key_checking = False
```