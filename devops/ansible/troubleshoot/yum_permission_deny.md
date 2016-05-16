执行以下安装rpm包

```
- hosts: ag
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

出现安装rpm报错

```bash
TASK: [Install virt_tools] ****************************************************
failed: [192.168.1.1] => {"failed": true, "parsed": false}
Traceback (most recent call last):
  File "/home/admin/.ansible/tmp/ansible-tmp-1458884343.55-69828320762502/yum", line 3371, in ?
    main()
  File "/home/admin/.ansible/tmp/ansible-tmp-1458884343.55-69828320762502/yum", line 983, in main
    disablerepo, disable_gpg_check)
  File "/home/admin/.ansible/tmp/ansible-tmp-1458884343.55-69828320762502/yum", line 901, in ensure
    my = yum_base(conf_file)
  File "/home/admin/.ansible/tmp/ansible-tmp-1458884343.55-69828320762502/yum", line 185, in yum_base
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
OSError: [Errno 13] Permission denied: '/var/cache/yum/example.5.i386.stable/multi-repomd.xml.old.tmp'

FATAL: all hosts have already failed -- aborting

PLAY RECAP ********************************************************************
           to retry, use: --limit @/home/admin/deploy_ping_monitor.retry

192.168.1.1               : ok=2    changed=0    unreachable=0    failed=1
```

手工测试了一下，实际登录到服务器上，执行手工安装命令是完成成功的

```bash
sudo rpm -ivh /tmp/virt_tools-1.1.1.el5.x86_64.rpm
```

输出显示

```bash
Preparing...                ########################################### [100%]
   1:virt_tools             ########################################### [100%]
/sbin/ldconfig: /opt/lib64/libmysql.so.16.0.0 is not a symbolic link
```

并且，即使提前安装了`virt_tools`软件包之后依然出现上述报错。也就是可以看出，实际上是因为对yum缓存目录缺少权限导致的。

参考 [Become (Privilege Escalation)](http://docs.ansible.com/ansible/become.html):

Ansible允许以某个用户帐号登录系统（`remote user`），然后切换（`become`）到另一个用户来使用诸如`sudo`，`su`，`pfexec`，`doas`，`pbrun`等权限加强工具。

每个主机只能使用一种sudo方式。