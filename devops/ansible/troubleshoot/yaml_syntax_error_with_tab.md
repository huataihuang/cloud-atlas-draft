
一个简单的playbook

```yaml
---
- hosts: virthost
  tasks:
  - name: copy virt_tools rpm
    copy:
      src: virt_tools-1.1.1.el5.x86_64.rpm
      dest: /tmp/virt_tools-1.1.1.el5.x86_64.rpm
  - name: Install virt_tools
    yum:
      name: /tmp/virt_tools-1.1.1.el5.x86_64.rpm
      state: present
```

但是我尝试

```bash
export ANSIBLE_INVENTORY=./hosts
ansible-playbook deploy_virt_tools/deploy_virt_tools.yml
```

出现报错

```bash
ERROR! Syntax Error while loading YAML.


The error appears to have been in '/Users/huatai/tmp/ansible/deploy_virt_tools/deploy_virt_tools.yml': line 2, column 9, but may
be elsewhere in the file depending on the exact syntax problem.

The offending line appears to be:

- hosts: virthost
  tasks:
        ^ here
```

折腾了好久，猛然发现，原来`tasks:`后面多加了一个`TAB`（编辑的时候看不出行后多余的`TAB`），导致了上述语法错误。

> **在编辑`YAML`文件时候，需要小心不要引入`TAB`键！此外`YAML`文件对于空白非常敏感，因为`YAML`使用空白来对不同的信息进行分组！**

* `YAML`文件开头有`---`，这是因为YAML文件允许多个"documents"，每个文档都用`---`分隔。不过，对于Ansible，每个文件只有一个"文档"，所以只有文件的开有有`---`
* `YAML`文件对于空格非常敏感，并使用空白来分组信息。在配置文件中只能使用`标准一致的`空格（文件格式），不能用`TAB`
* 使用`-`开头的行表示列表内容
* 使用`key: value`操作的格式是哈希或者字典的项目

# 参考

* [How To Create Ansible Playbooks to Automate System Configuration on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-create-ansible-playbooks-to-automate-system-configuration-on-ubuntu)