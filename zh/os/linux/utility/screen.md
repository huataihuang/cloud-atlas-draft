GNU Scree是一个终端多路复用管理器，用于同时并发的镀铬虚拟控制台，允许用在一个登录会话中访问分隔的会话，或者断开并重连一个终端的会话。这样，用户远程登录到服务器，即使关闭终端，也可以再次登录服务器访问上次断开的终端。

# screen使用tips

按 `Ctrl-a`，然后在当前窗口中按双引号键（`"`），就可以看到会话中可用窗口的列表

终止当前窗口的方法是，在窗口的 shell 提示上输入 `exit`，或者按键盘快捷键 `Ctrl-a`，然后按 `k`（小写的字母 `K`，代表 “kill”）。如果使用后一种方法，那么在窗口底部会出现一个警告，要求您确认要杀死此窗口。按 `y`（小写的字母 Y，代表 “yes”）确认，或按 `n`（小写的字母 N，代表 “no”）拒绝。

指定窗口名称的方法是，激活窗口，按 `Ctrl-a A`（大写的字母 `A`，代表 “Annotate”），根据需要按 Backspace 删除现有的名称，然后在提示上输入一个有意义的名称

**可以使用状态栏在视觉上进一步区分各个窗口** : 主目录中创建包含以下代码的 `.screenrc` 文件

    hardstatus on
    hardstatus alwayslastline
    hardstatus string "%{.bW}%-w%{.rW}%n %t%{-}%+w %=%{..G} %H %{..Y} %m/%d %C%a "

`screen -t name` 命令在创建窗口时指定窗口名称

`screen -L` 命令把每个窗口的输出记录在日志中。每个窗口有自己的日志文件，文件名通常是 `~/screenlog.n`，其中的 `n` 是窗口列表中显示的窗口编号。

最有用的组合键包括：按 `Ctrl-a`，然后按 `0`（数字零）到 `9` 立即切换到特定的窗口；按 `Ctrl-a`，然后按 `C`（大写的字母 C，代表 “Clear”）清除一个窗口的内容；按 `Ctrl-a`，然后按 `H` 启用或禁用日志记录；按 Ctrl-a，然后按 Ctrl-a 在当前窗口和前一个窗口之间来回切换；按 `Ctrl-a`，然后按 `Ctrl-\`（反斜杠）杀死所有窗口并终止当前的 Screen 会话

Screen 会话的连接，可以用 `screen -p ID` 命令重新连接特定的窗口，其中的 `ID` 是一个数字或名称

    screen -r -p ghost

**多用户模式连接其它窗口**

    screen -x -r sharing -p one

> 这里 `-x` 表示多用户哦是，`-p one`表示连接到另外一个名字叫`one`的窗口，这样两个窗口就连接在一起，并且可以看到共同的输入输出。

**屏幕分隔**

快捷键是`Ctrl-a |`。分屏以后，可以使用`Ctrl-a <tab>`在各个区块间切换

![screen屏幕分隔](/img/os/utility/Gnuscreen.png)

**C/P模式和操作**

使用快捷键`Ctrl-a <Esc>`或者`Ctrl-a [`可以进入copy/paste模式，这个模式下可以像在vi中一样移动光标，并可以使用空格键设置标记。其实在这个模式下有很多类似vi的操作，譬如使用/进行搜索，使用y快速标记一行，使用w快速标记一个单词等。关于C/P模式下的高级操作，其文档的这一部分有比较详细的说明。

一般情况下，可以移动光标到指定位置，按下空格设置一个开头标记，然后移动光标到结尾位置，按下空格设置第二个标记，同时会将两个标记之间的部分储存在copy/paste buffer中，并退出copy/paste模式。在正常模式下，可以使用快捷键`Ctrl-a ]`将储存在buffer中的内容粘贴到当前窗口。

# ssh远程后台在screen中执行脚本

> 这个功能是screen的杀手锏，提供了远程在后台执行脚本的能力。并且可以随时连接到screen进行维护

参考[how to run a command in background using ssh and detach the session](http://stackoverflow.com/questions/1628204/how-to-run-a-command-in-background-using-ssh-and-detach-the-session)

    screen -S restart_network -dm /etc/init.d/network restart

这样 `-dm` 命令可以执行shell时断开，以便后续再连接访问。

```bash
	   -d|-D [pid.tty.host]
            does not start screen, but detaches the elsewhere running screen session. It has the same  effect  as  typing
            "C-a  d" from screen’s controlling terminal. -D is the equivalent to the power detach key.  If no session can
            be detached, this option is ignored. In combination with the  -r/-R  option  more  powerful  effects  can  be
            achieved:	        
		-m   causes screen to ignore the $STY environment variable.  With  "screen  -m"  creation  of  a  new  session  is
            enforced, regardless whether screen is called from within another screen session or not. This flag has a spe-
            cial meaning in connection with the ‘-d’ option:        
		-d -m   Start screen in "detached" mode. This creates a new session but doesn’t attach to it. This is  useful  for
        system startup scripts.
```

> 使用`screen`的好处是某些需要使用tty的工具可以正常执行
>
> 注意`一定要正常能够执行的shell脚本`，否则会直接结束，并且返回值还是`0`，就不知道是否正确执行脚本了

使用`nohup`也可以实现

    ssh remoteserver 'nohup /path/to/script `</dev/null` >nohup.out 2>&1 &'

但是nohup方式不利于再次连接终端进行检查。

一个案例：需要在服务器上通过`strace`工具来跟踪程序`example_program`

```bash
pssh -ih nc_list 'screen -S strace_example_program -d -m sudo strace -o example_program.strace -p `pgrep example_program`'
```

# 参考

* [对话 UNIX: 使用 Screen 创建并管理多个 shell](http://www.ibm.com/developerworks/cn/aix/library/au-gnu_screen/index.html)
* [linux screen 命令详解](http://www.cnblogs.com/mchina/archive/2013/01/30/2880680.html)
* [WikiPedia: GNU Screen](https://en.wikipedia.org/wiki/GNU_Screen)
* [linux 技巧：使用 screen 管理你的远程会话](https://www.ibm.com/developerworks/cn/linux/l-cn-screen/)
* [The Antidesktop](http://freecode.com/articles/the-antidesktop) 一个有趣的桌面替代方案
