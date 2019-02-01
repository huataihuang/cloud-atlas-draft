# command模块执行不返回变量

本文的撰写契机是因为我想修改kvm服务器上的`libvirtd.conf`配置，在修改之前，想先备份该配置文件。简单的复制成 `libvirtd.conf.bak`文件担心多次执行备份被覆盖，所以想使用常见的脚本 `date +%Y-%m-%d_%H:%M:%S` 作为文件名后缀，类似常用的脚本：

```
cp /etc/libvirt/libvirtd.conf /etc/libvirt/libvirtd.conf.bak`date +%Y-%m-%d_%H:%M:%S`
```

我以为ansible `command` 模块也是类似执行shell命令，但是结果却出乎意料

完整的 playbook `fix_libvirtd.yaml` 如下

```yaml
---
- hosts: all
  sudo: true
  gather_facts: False
  vars:
    libvirtd_conf: libvirtd.conf
  tasks:

  - name: copy libvirtd_conf
    copy:
      src: "{{ libvirtd_conf }}"
      dest: /tmp/{{ libvirtd_conf }}

  - name: backup libvirtd_conf
    command: cp /etc/libvirt/libvirtd.conf /etc/libvirt/libvirtd.conf.bak_`date +%Y-%m-%d_%H:%M:%S`

  - name: replace libvirtd_conf
    command: cp /tmp/{{ libvirtd_conf }} /etc/libvirt/libvirtd.conf

  - service: name=libvirtd state=restarted
```

然而发现报错提示

```
stderr: cp: target ‘+%Y-%m-%d_%H:%M:%S`’ is not a directory
failed: [192.168.1.1] => {"changed": true, "cmd": ["cp", "/etc/libvirt/libvirtd.conf", "/etc/libvirt/libvirtd.conf.bak_`date", "+%Y-%m-%d_%H:%M:%S`"], "delta": "0:00:00.049106", "end": "2016-09-26 23:35:15.798034", "rc": 1, "start": "2016-09-26 23:35:15.748928", "warnings": []}
```

这说明Ansible的`command`模块传递命令是以空格作为变量分隔，就尝试改成

```
  - name: backup libvirtd_conf
    command: cp /etc/libvirt/libvirtd.conf /etc/libvirt/libvirtd.conf.bak_`date\ +%Y-%m-%d_%H:%M:%S`
```

这次之行的结果是在目标主机上备份成了文件名

```
libvirtd.conf.bak_`date +%Y-%m-%d_%H:%M:%S`
```

并不是预想中的带时间戳的文件名。

# shell命令

Ansible还有一个标准模块`shell`，这个模块看上去和`command`模块非常类似，也是远程在服务器上执行命令。但是有没有什么区别呢？

我们来尝试一下：

```
  - name: backup libvirtd_conf
    shell: cp /etc/libvirt/libvirtd.conf /etc/libvirt/libvirtd.conf.bak_`date +%Y-%m-%d_%H:%M:%S`
```

果然，仅仅修改了Ansible 模块的名字就在目标主机正确生成了文件 `libvirtd.conf.bak_2016-09-26_23:41:05`

# command和shell区别

* command模块

command模块执行命令跟随一系列空格分隔的参数。注意`command`不是通过shell执行的，所以不能使用环境变零 `$HOME` 以及操作符 `<`，`>`，`|` 和 `&`。其他则和shell没有区别

* shell模块

shell模块是通过远程主机上的shell来执行的(`/bin/sh`)，所以可以实现较为复杂的命令。

* raw模块

还有一种直接通过SSH命令底层执行的方法，不通过模块子系统。这个模式适合2中情况：第一种情况是在旧系统（Python 2.4或更早）安装`python-simplejson`，这样就需要作为依赖的模块。另一种情况是和一些没有安装Python的设备，如路由器交互。这里`raw`模式执行的所有参数都直接在远程配置的shell中执行。标准输出，标准错误输出和返回码都在可用时返回。这个方法不需要模块支持，不需要远程主机安装Python。

> 大多数情况建议使用`shell`和`command`模块，仅在老版本python或没有python模块的路由器上使用`raw`方式。

# 修正后的 playbook

```yaml
---
- hosts: all
  sudo: true
  gather_facts: False
  vars:
    libvirtd_conf: libvirtd.conf
  tasks:

  - name: copy libvirtd_conf
    copy:
      src: "{{ libvirtd_conf }}"
      dest: /tmp/{{ libvirtd_conf }}

  - name: backup libvirtd_conf
    shell: cp /etc/libvirt/libvirtd.conf /etc/libvirt/libvirtd.conf.bak_`date +%Y-%m-%d_%H:%M:%S`

  - name: replace libvirtd_conf
    command: cp /tmp/{{ libvirtd_conf }} /etc/libvirt/libvirtd.conf

  - service: name=libvirtd state=restarted
```

# 参考

* [Ansible Modules – shell vs. command](https://blog.confirm.ch/ansible-modules-shell-vs-command/)
* [Ansible中shell，command，raw模块的区别](https://my.oschina.net/mesopotamia/blog/490272)