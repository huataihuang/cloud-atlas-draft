在shell脚本中检查调用命令执行是否超时，可以非常简单地使用[timeout](../utilities/timeout)工具。但是，在早期的 RHEL/CentOS 5 系列操作系统，由于coreutils工具包版本较低，没有包含timeout程序，则可以通过expect脚本来实现类似功能。

```bash
################################################################################
# Executes command with a timeout
# Params:
#   $1 timeout in seconds
#   $2 command
# Returns 1 if timed out 0 otherwise
timeout() {

    time=$1

    # start the command in a subshell to avoid problem with pipes
    # (spawn accepts one command)
    command="/bin/sh -c \"$2\""

    expect -c "set echo \"-noecho\"; set timeout $time; spawn -noecho $command; expect timeout { exit 1 } eof { exit 0 }"    

    if [ $? = 1 ] ; then
        echo "Timeout after ${time} seconds"
    fi

}
```

使用方法

```bash
timeout 10 "ls ${HOME}"
```

# 参考

* [How to introduce timeout for shell scripting?](https://unix.stackexchange.com/questions/43340/how-to-introduce-timeout-for-shell-scripting)