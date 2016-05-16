# 根据条件执行

通过ansible检查主机上是否安装了某个rpm包，如果没有安装则执行特定脚本：

由于`rpm -q`可以检查一个包是否存在，并且如果包不存在就会返回`package XXXX is not installed`，所以思路先执行`rpm -q XXX`，将执行返回的结果存放到值`rpm_check`中，然后根据`rpm_check`打印输出中`find`是否存在字符串`is not installed`，检查字符串的结果为`1`表示没有就表明匹配上了`is no installed`，也就是确实没有安装软件包，就可以执行脚本：

```bash
- name: Check if foo.rpm is installed
  command: rpm -q foo.rpm
  register: rpm_check

- name: Execute script if foo.rpm is not installed
  command: somescript
  when: rpm_check.stdout.find('is not installed') == 1
```

# 参考

* [How to make Ansible execute a shell script if a package is not installed](http://stackoverflow.com/questions/21892603/how-to-make-ansible-execute-a-shell-script-if-a-package-is-not-installed)