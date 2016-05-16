# Playbooks简介

Playbooks是Ansible的配置，部署和编排语言。Playbooks可以描述需要远程系统执行的策略来增强或设置一系列处理步骤。

在底层，playbooks可以用于管理配置并分发到远程主机。从更高层次来看，它可以排列多个层级任务，包括滚动升级，并且可以将工作分配给其他主机，和监控服务器、负载均衡交互。

palybooks被设计成可读并且使用基本的文本语言开发。有多种方式来组织playbooks以及它们包含的文件。

> 建议阅读[Example Playbooks](https://github.com/ansible/ansible-examples)。

playbooks用于申明配置，但是也可以组织任何人工顺序处理，甚至是作为回滚和作为不同主机之间不同步骤执行。可以同步或异步调用任务。

# playbook语言案例

playbooks使用YAML格式撰写，并且有一个很小的语法集，这样就可以不作为编程语言或者脚本，而仅仅是配置或者过程的一个模式来使用。

每个playbook由一个或多个列表中的`plays`来组成。

# playbooks基础

## Hosts和Users

对于playbook中的每个play，需要选择架构中的哪个主机作为目标并确定之行步骤（称为任务，tasks）的用户。

`hosts`行是分组或者主机部分，通过冒号分隔。`remote_user`则表示远程执行命令的用户的账号

```yaml
---
- hosts: webservers
  remote_user: root
```

`remote_user`也可以在每个任务中定义

```yaml
---
- host: webservers
  remote_user: root
  tasks:
    - name: test connection
    ping:
    remote_user: yourname
```

Ansible也支持以其它用户身份执行

```yaml
---
- hosts: webservers
  remote_user: yourname
  become: yes
```

也可以通过`sudo`方式在部分任务中切换身份

```yaml
---
- hosts: webservers
  remote_user: yourname
  tasks:
    - service: name=nginx state=started
    become: yes
    become_method: sudo
```

或者登录后，切换到其它用户身份

```yaml
---
- hosts: webservers
  remote_user: yourname
  become: yes
  become_user: postgres
```

如果需要可以设置`sudo`密码，使用`ansible-playbook`的`--ask-become-pass`方式。如果在运行一个`become`的playbook，然后这个playbook似乎停止了，则可能是在等待切换身份的密码输入提示上。可以`Ctrl-C`杀死ansible，然后添加相应的密码参数后再执行。

## 任务列表

每个play包含了一系列任务。任务是顺序执行的，每次一个任务，通过`host`部分的主机匹配所有的主机，完成任务后再执行下一个任务。需要注意的是，在一个play中，所有主机是执行相同的任务。也可以通过一个play来映射选择的主机到任务上。

当运行一个playbook，是从上往下执行的，当主机执行任务失败，就会被剔除出整个playbook的循环。如果事情失败，简单地修正playbook文件再重新运行。

每个任务的目标是以特定参数来执行一个模块。变量是模块所使用的参数。

模块是`幂等`的（`idempotent`），也就是说不管你运行多少次，执行的结果都是相同的并符合计划中带给系统的最终状态。这样就可以安全地多次运行相同的playbook。

`command`和`shell`模块通常以相同命令重复运行，如果命令是类似`chmod`或`setsebool`等。然而，如果是`creates`标记，则会导致模块不幂等。

每个任务都有一个`name`，包含了运行playbook的输出。这个输出是可读的，所以非常容易描述每个任务执行。如果名字没有提供，则使用`action`字符字段来用于输出。

这里一个基本的例子，这里service模块任务使用`key=value`参数：

```yaml
tasks:
  - name: make sure apache is running
  service: name=httpd state=running
```

`command`和`shell`模块是仅有的需要参数的模块，并且不使用`key=value`方式。这种方式使得按照期望的简单方式运行

```bash
tasks:
  - name: disable selinux
    command: /sbin/setenforce 0
```

`command`和`shell`模块关注返回值，所以如果命令成功执行但是返回值不是0，则可以如下方法执行

```bash
tasks:
  - name: run this command and ignore the result
    shell: /usr/bin/somecommand || /bin/true
```

或者按照以下方法：

```bash
tasks:
  - name: run this command and ignore the result
    shell: /usr/bin/somecommand
    ignore_errors: True
```

如果动作行太长，可以将命令行折返，中间以任意连续行的缩进，类似：

```bash
tasks:
  - name: Copy ansible inventory file to client
    copy: src=/etc/ansible/hosts dest=/etc/ansible/hosts
			owner=root group=root mode=0644
```

变量可以用于动作行。假设你在`vars`段落定义了一个`vhost`变量，可以如下使用：

```bash
tasks:
  - name: create a virtual host file for {{ vhost }}
    template: src=somefile.j2 dest=/etc/httpd/conf.d/{{ vhost }}
```

# 处理：根据变化运行操作

模块是`幂等`的，根据远程系统的不同会有改变。playbooks可以感知系统的差异，并且根据不同环境使用基本的事件系统。

这个`通知`动作是在playbook的任务块的底部触发的，并且通过多个不同的通知只会触发一次。

举例，多个资源可能都标记了需要重启apache服务，因为它们都修改了一个配置文件，但是apache只会触发一次重启以避免不必要的服务重启。

以下是一个文件修改后重启两个对应服务的案例：

```yaml
- name: template configuration file
  template: src=template.j2 dest=/etc/foo.conf
  notify:
    - restart memcached
    - restart apache
```

在`notify`段落列出了任务需要调用处理的事情被称为`handlers`（处理者）。

handlers是任务列表，和常规的任务没有什么不同，在全局引用时必须唯一。handlers是通知出发，如果没有通知，就不运行。不论多少事情通知给handler，都只运行一次，只在这部分play所有任务都完成时触发。

以下是一个`handlers`部分的案例

```yaml
handlers:
  - name: restart memcached
    service: name=memcached state=restarted
  - name: restart apache
    service: name=apache state=restarted
```

handlers是最好的处理重启服务或者触发重启系统的方式。

> **注意**
> * 触发handlers总是按照顺序来编写的
> * handler名字是全局名字空间的
> * 如果两个handler使用了相同的名字，只会运行其中一个handler
> * 不能在一个include中定义一个触发handler

此外还要指出：

* 在`pre_tasks`，`tasks`和`post_tasks`段落定义的handler是自动在它们被通知的结尾部分刷新的
* 在`roles`段落的handers是在`tasks`段落的结尾刷新的，但是比其它`tasks`的handlers要早触发。

如果要立即触发所有的handler命令，可以使用如下方法

```yaml
tasks:
  - shell: some tasks go here
  - meta: flush_handlers
  - shell: some other tasks
```

以上案例中，当`meta`状态到达时候，所有队列中的handlers将被执行处理。这种方式适合一次又一次触发的情况（状态触发？）。

# 执行playbook

以下方式是以并发`10`方式执行一个playbook

```bash
ansible-playbook playbook.yml -f 10
```

# ansible-pull

`ansible-pull`是一个小脚本，用于从`git`中`checkout`出一个仓库的配置结构，然后对取到的内容通过`ansible-playbook`方式运行。

假设你`checkout`位置是通过负载均衡访问的（也就是可以横向扩展），此时`ansible-pull`的扩展性几乎是无限的。

# 举例

* 检查`ansible-test`分组服务器是否启动了`sshd`服务 - `sshd.yml`

```yaml
---
- hosts: ansible-test
  tasks:
    - name: make sure ssh is running
      service: name=sshd state=running
```

执行测试

```bash
ansible-playbook sshd.yml -f 10
```

> `-f 10`表示10个并发执行任务

执行结果输出

```bash
PLAY [ansible-test] *********************************************************** 

GATHERING FACTS *************************************************************** 
ok: [root@192.168.1.101]
ok: [root@192.168.1.111]

TASK: [make sure ssh is running] ********************************************** 
ok: [root@192.168.1.111]
ok: [root@192.168.1.101]

PLAY RECAP ******************************************************************** 
root@192.168.1.101          : ok=2    changed=0    unreachable=0    failed=0   
root@192.168.1.111          : ok=2    changed=0    unreachable=0    failed=0   
```

> 使用`ansible`有一个非常好的优势就是工具已经针对各种操作系统做了对应的处理，抽象出相同的定义方法。实际上，目标服务器可以是不同类型和不同版本的linux操作系统，例如RHEL 6和RHEL 7对于服务检查的方法是不同的（RHEL引入了`systemd`），但是使用`ansible`进行检查可以自动完成不同操作系统的适配，底层使用对应的检查命令完成相同的检查。

以下命令可以检查`ansible-test`服务器分组显示服务器使用的是不同的操作系统版本

```bash
ansible ansible-test -m raw -a "cat /etc/redhat-release"
```

```bash
root@192.168.1.101 | success | rc=0 >>
CentOS Linux release 7.2.1511 (Core) 


root@192.168.1.111 | success | rc=0 >>
CentOS release 6.6 (Final)
```

注意，服务名字`sshd`不要错误写成`ssh`，否则就不能匹配，会返回错误

```bash
PLAY [ansible-test] *********************************************************** 

GATHERING FACTS *************************************************************** 
ok: [root@192.168.1.101]
ok: [root@192.168.1.111]

TASK: [make sure ssh is running] ********************************************** 
failed: [root@192.168.1.111] => {"failed": true}
msg: cannot find 'service' binary or init script for service,  possible typo in service name?, aborting
failed: [root@192.168.1.101] => {"cmd": "None show None", "failed": true, "rc": 2}
msg: [Errno 2] No such file or directory

FATAL: all hosts have already failed -- aborting

PLAY RECAP ******************************************************************** 
           to retry, use: --limit @/home/huatai/ssh.retry

root@192.168.1.101          : ok=1    changed=0    unreachable=0    failed=1   
root@192.168.1.111          : ok=1    changed=0    unreachable=0    failed=1   
```

























