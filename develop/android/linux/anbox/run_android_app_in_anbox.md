# 安装Anbox

> 当前官方只支持在Ubuntu 16.04 LTS中运行Anbox，其他Ubuntu环境有可能不能正常工作。Fedora目前没有找到何时的运行方法。主要原因是：Anbox使用了定制的内核，需要启用[DKMS](https://en.wikipedia.org/wiki/Dynamic_Kernel_Module_Support)内核模块。

```bash
snap install --classic anbox-installer && anbox-installer
```

# 安装应用程序

目前是通过[Android Debug Bridge (adb)](https://developer.android.com/studio/command-line/adb.html)来安装：

```bash
adb install path/to/my-app.apk
```

* 安装了Anbox之后需要重启操作系统系统

* 使用`adb devices`检查，此时还看不到设备。点击`Anbox`程序按钮，会启动一个空白的Anbox窗口。此时再次使用`adb devices`就会显示有一个模拟设别连接

```
$ adb devices
List of devices attached
emulator-5558	device
```

* 安装微信失败：

```
$ adb install weixin663android1260.apk 
adb: failed to install weixin663android1260.apk: Aborted (core dumped)
```

目前发现启动Anbox会导致系统响应非常缓慢，系统中会与性多个apport进程，并拖累其他应用。

```
top - 09:02:21 up 7 min,  3 users,  load average: 0.67, 0.36, 0.19
top - 09:09:51 up 15 min,  3 users,  load average: 7.36, 6.26, 3.11
Tasks: 210 total,   8 running, 200 sleeping,   0 stopped,   0 zombie
%Cpu(s): 71.5 us, 15.5 sy,  1.0 ni, 12.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  3776620 total,   959972 free,  1180048 used,  1636600 buff/cache
KiB Swap:  3927036 total,  3927036 free,        0 used.  2280472 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND                   
 9898 100000    20   0 1399340  51560  46260 t  15.6  1.4   0:00.47 main                      
 9960 root      20   0   81492  22180  10396 R  10.6  0.6   0:00.32 apport                    
 9965 root      20   0   81492  22008  10232 R   9.3  0.6   0:00.28 apport                    
 9972 root      20   0   55620  15336   7092 R   6.0  0.4   0:00.18 apport                    
 2572 101036    30  10   19560   4416   1996 S   4.7  0.1   0:07.61 logd                      
 9908 101013    20   0   22040   9024   7684 S   4.0  0.2   0:00.12 mediaserver               
 9978 root      20   0   38460  11080   5424 R   3.7  0.3   0:00.11 apport                    
 9900 101041    20   0   16324   7672   6508 t   3.3  0.2   0:00.10 audioserver               
 9906 101013    20   0   20704   8784   7504 S   3.3  0.2   0:00.10 mediadrmserver
```

由于我的Xubuntu笔记本性能非常弱（MacBook Air 2011），所以无法正常运行，暂时放弃。