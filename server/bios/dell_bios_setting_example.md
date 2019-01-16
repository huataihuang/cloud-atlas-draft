> Dell的BIOS修改工具参考[命令行修改BIOS](modify_bios_through_linux_command)安装，即可以通过`syscfg`工具进行设置。

# `interrupt remapping`设置

对于Dell的R510服务器，其使用的[Intel 5500 and 5520 chipsets (revision 0x13) and the Intel X58 chipset (revisions 0x12, 0x13, 0x22)存在Interrupt remapping的缺陷](https://www.novell.com/support/kb/doc.php?id=7014344)，需要在BIOS上关闭。

> Dell服务器BIOS（参考）

```
System BIOS Setting -> Processor Settings -> Visualization Technology (Enabled)
System BIOS Settings -> Integrated Devices -> SR-IOV Global Enable (Enabled)
    System Setup (click on finish) -> Device Settings -> 选择存储卡
        -> SRI-OV enabled with 8 virtual functions
```

# 参考

* [HowTo Set Dell PowerEdge R730 BIOS parameters to support SR-IOV](https://community.mellanox.com/docs/DOC-2249)