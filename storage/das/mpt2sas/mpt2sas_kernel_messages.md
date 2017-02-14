# 常见的`mpt2sas`日志

线上服务器`/var/log/messages`日志

* `0x31110630`

```
2016-12-12 17:08:32	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:33	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:35	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:36	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
```

* code 0x03

```
Jan 29 06:30:52 mpt2sas0: log_info(0x3003010a): originator(IOP), code(0x03), sub_code(0x010a)
Jan 29 06:30:52 mpt2sas0: log_info(0x3003010a): originator(IOP), code(0x03), sub_code(0x010a)
```

# `0x31111000`

```
2017-02-13 09:09:15	mpt2sas0: log_info(0x31111000): originator(PL), code(0x11), sub_code(0x1000)
2017-02-13 09:09:15	mpt2sas0: log_info(0x31111000): originator(PL), code(0x11), sub_code(0x1000)
```

> 这里`111000`似乎是一个异常的信息，服务器显示负载极高，磁盘`iowait`达到40+，检查磁盘sdg故障导致util达到100，采用[mpt2sas下线故障磁盘](mpt2sas_offline_fail_disk)方法处理后，这个`0x31111000`不再出现。

# 参考

* [understand mpt2sas kernel messages? ](https://hardforum.com/threads/understand-mpt2sas-kernel-messages.1828901/)
* [Deciphering continuing mpt2sas syslog messages](https://serverfault.com/questions/407703/deciphering-continuing-mpt2sas-syslog-messages)
* [Topic: cache drive changing to read_only](https://lime-technology.com/forum/index.php?topic=51476.0)