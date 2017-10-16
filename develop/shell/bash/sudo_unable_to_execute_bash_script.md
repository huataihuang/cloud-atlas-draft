同事传给我一个shell启动脚本，简单对比了一下线上脚本，判断没有问题，就上传到服务器上执行。执行需要使用sudo方式以root用户身份执行，但是遇到奇怪的问题，总是提示不能执行脚本：

```
$sudo /etc/init.d/my_service_script start
sudo: unable to execute /etc/init.d/my_service_script: Success
```

这个问题困扰了我，肉眼看脚本，一点都看不出语法和逻辑错误。并且这个脚本内容和线上已经在使用的脚本是完全一样的。

然而，当我不死心，先切换到root身份，然后不使用`sudo`而是直接运行脚本，则shell提示看出了问题：

```
#/etc/init.d/my_service_script start
-bash: /etc/init.d/my_service_script: /bin/bash^M: bad interpreter: No such file or directory
```

剔除了`sudo`影响，可以看到脚本中在`#!/bin/bash`解释器行末尾多出了`^M`符号，这是由于对方使用了Windows操作系统复制粘贴脚本，导致多出了隐含字符，影响了解释器路径。

如何显示出隐藏字符？

参考 [How to Display Hidden Characters in vim?](https://askubuntu.com/questions/74485/how-to-display-hidden-characters-in-vim) 可以通过以下指令在vim中检查隐藏字符：

```
:set listchars=eol:$,tab:>-,trail:~,extends:>,precedes:<
:set list
```

观察发现对方传输给我的shell脚本中，每一行末尾都显示了一个`$`符号。但是很奇怪，并没有看到`^M`

可以使用`cat -v filename`来显示详细的信息，包含隐藏字符。

转换windows文档可以使用`dos2unix`命令：

```
dos2unix filename.txt
```

# 参考

* [File format](http://vim.wikia.com/wiki/File_format)