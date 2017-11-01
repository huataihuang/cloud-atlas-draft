# 传递参数变量给xargs

有时候需要传递变量给xargs来执行，则使用`-I {}`参数

```
echo 192.168.1. | xargs -I{} grep {} *.txt
```

```
export TEST=hallo2
echo "hallo" | xargs sh -c 'echo passed=$1 test=$TEST' sh
```

# 将多行输出转换成一行

xargs有一个神奇的功能就是将一个命令的多行输出转换成一行，这样就方便在shell中引用为字符串变量进行分隔处理

```
um@server#ls -1 *.sh
linux_sysinfo.sh
aix_sysinfo.sh
audit_script.sh
chperm_messages.sh

um@system#ls -1 *.sh | xargs
linux_sysinfo.sh aix_sysinfo.sh audit_script.sh chperm_messages.sh
```

# 参考

* [How to pass command with parameters to xargs](https://stackoverflow.com/questions/34669239/how-to-pass-command-with-parameters-to-xargs)
* [bash: xargs passing variable](https://stackoverflow.com/questions/15430877/bash-xargs-passing-variable)
* ["xargs" All-IN-One Tutorial Guide](http://www.unixmantra.com/2013/12/xargs-all-in-one-tutorial-guide.html)