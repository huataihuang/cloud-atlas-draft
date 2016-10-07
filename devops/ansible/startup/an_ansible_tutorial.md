# Ansible简介

Ansible是一个类似Chef, Puppet 或 Salt 的配置管理管理工具，并且非常容易上手 - 因为其只依赖服务器上运行SSH服务，通过SSH连接服务器并运行配置任务。

Ansible非常适合将bash脚本转换成Ansible任务，并且由于其基于SSH，所以很容易检查运行结果。Ansible适合重复以及复杂的配置脚本，并在运行前会基于Facts，也就是系统和环境信息。

Ansible使用这些环境facts来检查状态以及确定是否需要变更，这样可以确保服务器最终一致性，即可以一遍遍运行Ansible得到相同的结果。

# Ansible安装

请参考 [官方安装手册](http://docs.ansible.com/intro_installation.html#latest-releases-via-apt-ubuntu) 安装，例如，Ubuntu安装：

```
sudo apt-add-repository -y ppa:ansible/ansible
sudo apt-get update
sudo apt-get install -y ansible
```

# 管理服务器

Ansible默认使用inventory文件定义被管理的服务器列表，安装后的案例文件是 `/etc/ansible/hosts` 可以将这个文件移动后使用自己定义的文件

```
sudo mv /etc/ansible/hosts /etc/ansible/hosts.orig
```

创建自己的 `/etc/ansible/hosts` ，例如定义 `web` 标签的服务器组

```
[web]
192.168.22.10
192.168.22.11
```

要定义动态清单可以参考 [creating a dynamic inventory](http://docs.ansible.com/ansible/intro_dynamic_inventory.html)

# 基础：运行命令

```
ansible all -m ping
```

可以定义使用密码登录服务器并使用账号 `vagrant` （这里的案例）

```
ansible all -m ping -s -k -u vagrant
```

注释：

* `all` 清单文件中所有定义主机
* `-m ping` 使用ping模块
* `-s` 使用`sudo`来运行命令
* `-k` 询问密码而不是使用用户密钥认证
* `-u vagrant` 使用`vagrant`账号登录远程服务器

# 模块

Ansible使用模块来完成任务，模块可以用来安装软件，复制文件，使用模版以及[更多任务](http://docs.ansible.com/modules_by_category.html)。

模块可以使用相关的`Facts`以便决策是否采取动作。

如果不使用模块，则可以使用`shell`命令方式：

```
ansible all -s -m shell -a `apt-get install nginx`
```

虽然可以使用shell，但是建议使用模块完成任务，模块可以确保一致性。

```
ansible all -s -m apt -a 'pkg=nginx state=installed update_cache=true'
```

# 基本playbook

[Playbooks](http://docs.ansible.com/playbooks_intro.html)可以运行多个任务并提供更多高级功能。

> 在Ansible中Playbooks和Roles都使用Yaml

创建 `nginx.yml`

```yaml
---
- hosts: local
  tasks:
   - name: Install Nginx
     apt: pkg=nginx state=installed update_cache=true
```

执行

```
ansible-playbook -s nginx.yml
```

也可以使用如下方法通过`vagrant`账号登录远程服务器并sudo执行

```
ansible-playbook -s -k -u vagrant nginx.yml
```

# Handlers

Handler（处理者）类似Task，但是是通过其他Task调用的。你可以将Handler视为一个事件系统的一部分。一个Handler会在被其监听的事件调用时执行一个动作。

这个"第二个"动作在需要运行一个任务之后调用非常合适，例如在安装完成软件后启动一个新的服务或者在配置修改以后重新加载服务：

```yaml
---
- hosts: local
  tasks:
   - name: Install Nginx
     apt: pkg=nginx state=installed update_cache=true
     notify:
      - Start Nginx

  handlers:
   - name: Start Nginx
     service: name=nginx state=started
```

# 参考

* [An Ansible Tutorial](https://serversforhackers.com/an-ansible-tutorial)