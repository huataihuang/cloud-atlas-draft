# 说明

安装完CentOS之后首次升级整个操作系统，不过，升级前先修改repo配置，确保改成正确的版本

* 修改配置文件

对于简单的配置文件修改可以采用复制方法，复杂的替换需要使用模块。

> 参考 [Which is the best way to make config changes in conf files in ansible](http://stackoverflow.com/questions/22339832/which-is-the-best-way-to-make-config-changes-in-conf-files-in-ansible)

* 使用`command`模块执行命令(复杂命令使用`shell`模块)
* 使用`yum`模块进行升级

# 初步的playbook

```yaml
- hosts: new
  tasks:
    - name: clean no need repo config
      command: rm -f /etc/yum.repos.d/*
      notify:
        - Remove all old repo config
    - name: cp rhel.repo
      copy: src=rhel.repo dest=/etc/yum.repos.d/rhel.repo owner=root group=root mode=0644
    - name: upgrade all packages
      yum: name=* state=latest
```

> `copy`和`yum`模块不能使用`notify`，而`command`模块可以使用`notify`
>
> 建议不要使用`rm`命令，改为使用`file`模块的`state=absent`，因为执行时候有提示 `[WARNING]: Consider using file module with state=absent rather than running rm`

# 改进后的playbook

```yaml
- hosts: new
  tasks:
    - shell: ls -1 /etc/yum.repos.d
      register: contents
    - file: path=/etc/yum.repos.d/{{ item }} state=absent
      with_items: contents.stdout_lines
    - name: cp rhel.repo
      copy: src=rhel.repo dest=/etc/yum.repos.d/rhel.repo owner=root group=root mode=0644
    - name: upgrade all packages
      yum: name=* state=latest
	- name: cp epel.rpm
	  copy: src=epel-release-latest-7.noarch.rpm dest=/tmp/epel-release-latest-7.noarch.rpm
	- name: Install package.
	  yum:
	     name: /tmp/epel-release-latest-7.noarch.rpm
	     state: present
```

## 删除目录下多个文件的技巧

参考[ansible - delete unmanaged files from directory?](http://stackoverflow.com/questions/16385507/ansible-delete-unmanaged-files-from-directory)，解决的方法是先`ls`目录下文件，将得到的文件存入变量，然后用这个变量来做`absent`

```yaml
- shell: ls -1 /some/dir
  register: contents

- file: path=/some/dir/{{ item }} state=absent
  with_items: contents.stdout_lines
  when: item not in managed_files
```

## 从远程目录下载多个文件

> [How to fetch multiple files from remote machine to local with Ansible](http://serverfault.com/questions/691080/how-to-fetch-multiple-files-from-remote-machine-to-local-with-ansible)也是用了相似的方式，将远程目录下多个文件下载到本地

```yaml
- shell: (cd /remote; find . -maxdepth 1 -type f) | cut -d'/' -f2
  register: files_to_copy

- fetch: src=/remote/{{ item }} dest=/local/
  with_items: files_to_copy.stdout_lines
```

另外，[synchronise module](http://docs.ansible.com/ansible/synchronize_module.html)使用了rsync来

## 创建远程目录

> [How to create a directory using Ansible?](http://stackoverflow.com/questions/22844905/how-to-create-a-directory-using-ansible)

```bash
- name: Creates directory
  file: path=/src/www state=directory
```

[更多file模块选项](http://docs.ansible.com/file_module.html)

## rpm安装

```bash
- name: Copy rpm file to server
  copy:
     src: package.rpm
     dest: /tmp/package.rpm

- name: Install package.
  yum:
     name: /tmp/package.rpm
     state: present
```

> 前例中设置了安装[EPEL](https://fedoraproject.org/wiki/EPEL)以便安装必要的第三方软件包

# 执行

```bash
ansible-playbook upgrade_centos.yml -f 10
```

# 参考

* [yum - Manages packages with the yum package manager](http://docs.ansible.com/ansible/yum_module.html)
* [Which is the best way to make config changes in conf files in ansible](http://stackoverflow.com/questions/22339832/which-is-the-best-way-to-make-config-changes-in-conf-files-in-ansible)
* [Ansible Playbook to run Shell commands](http://stackoverflow.com/questions/20177996/ansible-playbook-to-run-shell-commands)
* [Install rpm package using Ansible](http://serverfault.com/questions/736538/install-rpm-package-using-ansible)
* [ansible - delete unmanaged files from directory?](http://stackoverflow.com/questions/16385507/ansible-delete-unmanaged-files-from-directory)
