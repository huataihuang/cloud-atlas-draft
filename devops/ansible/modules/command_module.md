# 概要

`command`模块管理带有一系列空格分隔的参数的命令。指定命令在所有选定的节点执行。注意：`command`模块不通过shell执行，所以环境变量，例如`$HOME`以及操作符如`<`，`>`，`|`和`&`不能生效。（如果你需要这些功能，则需要使用[shell](shell_module.md)模块）

# 案例

```bash
# Example from Ansible Playbooks.
- command: /sbin/shutdown -t now

# Run the command if the specified file does not exist.
- command: /usr/bin/make_database.sh arg1 arg2 creates=/path/to/database

# You can also use the 'args' form to provide the options. This command
# will change the working directory to somedir/ and will only run when
# /path/to/database doesn't exist.
- command: /usr/bin/make_database.sh arg1 arg2
  args:
    chdir: somedir/
    creates: /path/to/database
```

# 参考

* [command - Executes a command on a remote node](http://docs.ansible.com/ansible/command_module.html)