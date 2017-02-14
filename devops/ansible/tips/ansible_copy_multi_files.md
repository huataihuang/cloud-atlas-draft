# Loops

当需要在一个任务里面做很多事情的时候，例如创建一批用户，安装一批软件包，或者重复执行步骤直到满足某个结果，此时可以使用Ansible loops来实现。

> 详细请参考编译手册 [Ansible Playbooks: Loops](../playbooks/loops)

# 使用`with_fileglob` loop

`with_fileglob`会匹配单个目录下所有文件，非递归方式，所以可以使用通配符。它调用了 [Python's glob library](https://docs.python.org/2/library/glob.html) 使用方法类似如下

```
---
- hosts: all

  tasks:

    # first ensure our target directory exists
    - file: dest=/etc/fooapp state=directory

    # copy each file over that matches the given pattern
    - copy: src={{ item }} dest=/etc/fooapp/ owner=root mode=600
      with_fileglob:
        - /playbooks/files/fooapp/*
```

> 这里`with_fileglob:`要使用绝对路径

# 参考

* [Copy multiple files with Ansible](Copy multiple files with Ansible)
* [Ansible Documentation: Loops](http://docs.ansible.com/ansible/playbooks_loops.html)