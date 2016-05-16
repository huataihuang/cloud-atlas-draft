执行以下`deploy_rpm.yaml`

```bash
- hosts: install_server
  tasks:
  - name: copy example rpm
    copy:
      src: example-0.1.0.0-dev5.el5.x86_64.rpm
      dest: /tmp/example-0.1.0.0-dev5.el5.x86_64.rpm
  - name: Install virt_tools
    yum:
      name: /tmp/example-0.1.0.0-dev5.el5.x86_64.rpm
      state: present
```

发现出现如下错误

```bash
TASK: [Install example] **************************************************** 
failed: [192.168.1.1 => {"failed": true, "parsed": false}
Traceback (most recent call last):
  File "/home/admin/.ansible/tmp/ansible-tmp-1460215801.87-119327494457597/yum", line 3371, in ?
    main()
  File "/home/admin/.ansible/tmp/ansible-tmp-1460215801.87-119327494457597/yum", line 983, in main
    disablerepo, disable_gpg_check)
  File "/home/admin/.ansible/tmp/ansible-tmp-1460215801.87-119327494457597/yum", line 901, in ensure
    my = yum_base(conf_file)
  File "/home/admin/.ansible/tmp/ansible-tmp-1460215801.87-119327494457597/yum", line 185, in yum_base
    my.repos.setCacheDir(cachedir)
  File "/usr/lib/python2.4/site-packages/yum/__init__.py", line 689, in <lambda>
    repos = property(fget=lambda self: self._getRepos(),
  File "/usr/lib/python2.4/site-packages/yum/__init__.py", line 478, in _getRepos
    self.getReposFromConfig()
  File "/usr/lib/python2.4/site-packages/yum/__init__.py", line 367, in getReposFromConfig
    self.getReposFromConfigFile(repofn, repo_age=thisrepo_age)
  File "/usr/lib/python2.4/site-packages/yum/__init__.py", line 314, in getReposFromConfigFile
    thisrepo = self.readRepoConfig(parser, section)
  File "/usr/lib/python2.4/site-packages/yum/__init__.py", line 401, in readRepoConfig
    repos = repo.getSubrepos(parser, section, self.conf)
  File "/usr/lib/python2.4/site-packages/yum/yumRepo.py", line 319, in getSubrepos
    self._saveOldRepoXML(local)
  File "/usr/lib/python2.4/site-packages/yum/yumRepo.py", line 1108, in _saveOldRepoXML
    misc.unlink_f(fname)
  File "/usr/lib/python2.4/site-packages/yum/misc.py", line 776, in unlink_f
    os.unlink(filename)
OSError: [Errno 13] Permission denied: '/var/cache/yum/CentOS/multi-repomd.xml.old.tmp'


FATAL: all hosts have already failed -- aborting
```

原来，我在发出ansible指令的管理服务器是`admin`帐号，远程安装服务器需要使用`sudo`指令才能执行`root`角色的安装命令。

改进的方法是在需要使用`sudo`方式的指令能够前增加 `sudo: true` ，即以上playbook修改成

```bash
  - name: Install virt_tools
    sudo: true
    yum:
      name: /tmp/example-0.1.0.0-dev5.el5.x86_64.rpm
      state: present
```

这样安装过程远程`yum`指令执行时会通过`sudo`切换`root`权限执行。
