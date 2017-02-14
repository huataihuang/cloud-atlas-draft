
想通过中间转跳gw服务器通过ssh发送指令给内网的服务器，采用了如下脚本命令：

```
ssh gw "hostname;line_num=`echo \$((\$RANDOM%10))`;head -\$line_num /etc/server_list | tail -1"
```

> 这里假设`/etc/server_list`包含了集群中服务器的IP地址，希望能够随机从服务器IP列表中选择一台，所以这里使用了 

```
line_num=`echo \$((\$RANDOM%10))`
```

随机生成一个行数，然后将这行主机的IP地址从配置文件中提取出来（结合head核tail）

发现上述命令修改将输出IP地址存储到变量`ip`却始终没有响应

```
ssh gw "hostname;line_num=`echo \$((\$RANDOM%10))`;ip=`head -\$line_num /etc/server_list | tail -1`"
```

但是，我发现，明明gw服务器上存在`/etc/server_list`配置文件，但是ssh执行时总是提示不存在这个文件，

遇到如下报错

```
Pseudo-terminal will not be allocated because stdin is not a terminal.
```

这里真对`Pseudo-termial`有以下两种参数

```
-T' Disable pseudo-tty allocation.
-t' Force pseudo-tty allocation. 
```

所以通常转跳的ssh使用类似

```
/usr/bin/ssh -T -q -i $HOME/.ssh/one_command other_system
```

# 参考

* [Pseudo-terminal will not be allocated because stdin is not a terminal](http://unix.stackexchange.com/questions/82158/pseudo-terminal-will-not-be-allocated-because-stdin-is-not-a-terminal)