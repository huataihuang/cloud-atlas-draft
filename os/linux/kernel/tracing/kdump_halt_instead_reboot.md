实现[通过NFS存储系统内核core dump](kdump_over_nfs)可以看到，每次kdump完成core存储之后，默认会再次重启系统。但是也有一些情况下，希望系统不重启，保留现场，例如维持原有设备状态。



# 参考

* [Title: Red Hat Enterprise Linux 7 - How to Make kdump Halt Instead of Reboot After Successfully Saving a vmcore File](https://support.hpe.com/hpsc/doc/public/display?docId=mmr_kc-0129912)