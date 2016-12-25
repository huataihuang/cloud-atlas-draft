# 现状

线上服务器`/var/log/messages`日志骨断显示

```
2016-12-12 17:08:32	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:33	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:35	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
2016-12-12 17:08:36	mpt2sas0: log_info(0x31110630): originator(PL), code(0x11), sub_code(0x0630)
```

这个信息是表示存储卡出现问题还是磁盘故障呢？



# 参考

* [understand mpt2sas kernel messages? ](https://hardforum.com/threads/understand-mpt2sas-kernel-messages.1828901/)
* [Deciphering continuing mpt2sas syslog messages](https://serverfault.com/questions/407703/deciphering-continuing-mpt2sas-syslog-messages)
* [Topic: cache drive changing to read_only](https://lime-technology.com/forum/index.php?topic=51476.0)