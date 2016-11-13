# 修改core dump存储位置

`/proc/sys/kernel/core_pattern` 设置了生成core文件的路径，参考 `man core`

```
echo '/tmp/core_%e.%p' | sudo tee /proc/sys/kernel/core_pattern
```

上述命令可以使得core文件保存在`/tmp`目录下的 `core_[program].[pid]`

# 设置sysrq和nmi

* 启用sysrq

```
echo 1 | sudo tee /proc/sys/kernel/unknown_nmi_panic
```

* 启用nmi

```
echo 1 | sudo tee /proc/sys/kernel/sysrq
```

* 触发crash

```
echo c | sudo tee /proc/sysrq-trigger
```

* 也可以通过ipmi再次发送nmi（终极大招）

```
ipmitool -I lanplus -H <OOB_IP> -U <USERNAME> -P <PASSWORD> chassis power diag
```

# 参考

* [Changing location of core dump](http://stackoverflow.com/questions/16048101/changing-location-of-core-dump)
* [Generating an NMI through IPMI](http://www.ibm.com/support/knowledgecenter/linuxonibm/liaai.crashdump/liaaicrashdumpnmiipmi.htm)
* [How to trigger SysRq from ipmitool and ipmiconsole using the SysRq magic keys over an HP iLO4 ?](How to trigger SysRq from ipmitool and ipmiconsole using the SysRq magic keys over an HP iLO4 ?)
* [How to do SOL (Serial Over LAN aka Console Redirection) on Dell Servers](https://www.symantec.com/connect/articles/how-do-sol-serial-over-lan-aka-console-redirection-dell-servers)