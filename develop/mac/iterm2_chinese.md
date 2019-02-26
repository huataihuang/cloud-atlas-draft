最近一次安装的macSO 10.14 系统，由于我比较习惯英文界面，所以Perfered language选择English。但是，发现在iterm2中无法正确显示中文和输入中文。（其他应用软件都正常）。

搜索了一下，发现是由于环境变量中和locale相关参数导致的问题：

在执行 `locale` 命令可以看到如下输出，显示语言都没有包含支持utf-8

```
LANG=
LC_COLLATE="C"
LC_CTYPE="C"
LC_MESSAGES="C"
LC_MONETARY="C"
LC_NUMERIC="C"
LC_TIME="C"
LC_ALL=
```

虽然iterm2的Perferences设置Termianl的Character encoding为Unicode (UTF-8)，但是依然无法显示和输入中文。

解决方法是设置环境变量，即设置 `~/.bashrc`

```
LANG="en_US.UTF-8"
LC_COLLATE="en_US.UTF-8"
LC_CTYPE="en_US.UTF-8"
LC_MESSAGES="en_US.UTF-8"
LC_MONETARY="en_US.UTF-8"
LC_NUMERIC="en_US.UTF-8"
LC_TIME="en_US.UTF-8"
LC_ALL="en_US.UTF-8"
export LANG LC_COLLATE LC_CTYPE LC_MESSAGES LC_MONETARY LC_NUMERIC LC_TIME LC_ALL
```

然后 `. ~/.bashrc` 就可以正常使用中文输入。

同样，如果ssh远程登录到Linux服务器上，Linux服务器上也应该这样设置。