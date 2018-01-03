# 常见的`mpt2sas`日志

线上服务器`/var/log/messages`日志

# code(0x03), sub_code(0x010a)

```
Jan 29 06:30:52 mpt2sas0: log_info(0x3003010a): originator(IOP), code(0x03), sub_code(0x010a)
Jan 29 06:30:52 mpt2sas0: log_info(0x3003010a): originator(IOP), code(0x03), sub_code(0x010a)
```

[Driver mpt2sas0 spam dmesg - mpt2sas0: log_info(0x30030110): originator(IOP), code(0x03), sub_code(0x0110) ](https://bugs.launchpad.net/ubuntu/+source/linux/+bug/844555) 提供了排查思路：

* 在运行 `sas2ircu-status` 时会出现上述消息
* Dell提供了一个内建的检测工具可以检查SAS相关故障码
* Russell McOrmond (russell-flora) wrote on 2012-07-11: 更新存储卡的firmware可以修复这个问题

排查案例：

检查硬件

```
#lspci | grep -i lsi
04:00.0 Serial Attached SCSI controller: LSI Logic / Symbios Logic SAS2308 PCI-Express Fusion-MPT SAS-2 (rev 05)
```

> [LSI SAS2308控制芯片](lsisas2308)

# code(0x11), sub_code(0x0630)

```
2016-12-12 17:08:32	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:33	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:35	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:36	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
```

# code(0x11), sub_code(0x1000)

```
2017-02-13 09:09:15	mpt2sas0: log_info(0x31111000): originator(PL), code(0x11), sub_code(0x1000)
2017-02-13 09:09:15	mpt2sas0: log_info(0x31111000): originator(PL), code(0x11), sub_code(0x1000)
```

> 这里`111000`似乎是一个异常的信息，服务器显示负载极高，磁盘`iowait`达到40+，检查磁盘sdg故障导致util达到100，采用[mpt2sas下线故障磁盘](mpt2sas_offline_fail_disk)方法处理后，这个`0x31111000`不再出现。

# 参考

* [understand mpt2sas kernel messages? ](https://hardforum.com/threads/understand-mpt2sas-kernel-messages.1828901/)
* [Deciphering continuing mpt2sas syslog messages](https://serverfault.com/questions/407703/deciphering-continuing-mpt2sas-syslog-messages)
* [Topic: cache drive changing to read_only](https://lime-technology.com/forum/index.php?topic=51476.0)