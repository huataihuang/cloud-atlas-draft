# 安装rpm报错`There are unfinished transactions remainin`

```bash
TASK: [Install {{ package_1 }}] ***********************************************
failed: [192.168.1.11] => {"changed": true, "rc": 1, "results": ["Loaded plugins: branch, fastestmirror, security\nLoading mirror speeds from cached hostfile\nSetting up Install Process\nExamining /tmp/example-package-release13.el5.x86_64.rpm.rpm: example-package-release13.el5.x86_64.rpm\nMarking /tmp/example-package-release13.el5.x86_64.rpm.rpm as an update to example-package-release7.el5.x86_64\nResolving Dependencies\n--> Running transaction check\n---> Package example-package.x86_64 0:1.0.1-release13.el5 set to be updated\n--> Finished Dependency Resolution\n\nDependencies Resolved\n\n================================================================================\n Package\n   Arch   Version               Repository                                 Size\n================================================================================\nUpdating:\n kvm-vcpu-tool\n   x86_64 1.0.1-release13.el5   /example-package-release13.el5.x86_64.rpm 110 k\n\nTransaction Summary\n================================================================================\nInstall       0 Package(s)\nUpgrade       1 Package(s)\n\nTotal size: 110 k\nDownloading Packages:\n"]}
msg: There are unfinished transactions remaining. You might consider running yum-complete-transaction first to finish them.
```

参考[There are unfinished transactions remaining. You might consider running yum-complete-transaction first to finish them](http://www.cyberciti.biz/faq/rhel-centos-redhat-linux-there-are-unfinished-transactions-error/)，这个报错是因为以前的系统yum传输没有完成或中断，所以导致需要执行`yum-complete-transaction`来完成传输。不过，建议执行`yum-complete-transaction --cleanup-only`，这个`--cleanup`参数更为安全。

执行

```bash
sudo yum-complete-transaction --cleanup-only
```

显示输出

```bash
...
Cleaning up unfinished transaction journals
Cleaning up 2015-11-12.15:10.18
```

> 原来`2015-11-12`日的yum安装没有正确结束导致的问题。

清理之后再执行`ansible-playbook`就不再报`unfinished transactions remaining`错误