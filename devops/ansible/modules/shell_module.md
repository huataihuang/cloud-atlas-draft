# 概要

`shell`模块处理带有一串空格分隔的参数的命令。`shell`模块和`command`非常相似，但是它是通过shell`/bin/sh`来远程执行的。

# 案例

```bash
# Execute the command in remote shell; stdout goes to the specified
# file on the remote.
- shell: somescript.sh >> somelog.txt

# Change the working directory to somedir/ before executing the command.
- shell: somescript.sh >> somelog.txt chdir=somedir/

# You can also use the 'args' form to provide the options. This command
# will change the working directory to somedir/ and will only run when
# somedir/somelog.txt doesn't exist.
- shell: somescript.sh >> somelog.txt
  args:
    chdir: somedir/
    creates: somelog.txt

# Run a command that uses non-posix shell-isms (in this example /bin/sh
# doesn't handle redirection and wildcards together but bash does)
- shell: cat < /tmp/*txt
  args:
    executable: /bin/bash
```

# 参考

* [shell - Execute commands in nodes](http://docs.ansible.com/ansible/shell_module.html)