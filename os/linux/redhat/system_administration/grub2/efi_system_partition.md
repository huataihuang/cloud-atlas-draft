EFI系统分区是在UEFI启动下使用的，这个问题困扰了我很久，因为从学习DOS开始，一直使用的是MSDOS分区表，并且PC机通常都使用BIOS。然而，现代主机硬件已经进化到使用UEFI取代了BIOS，相应对文件系统分区提出了改动要求。如果依然按照以前的msdos分区表方式划分磁盘分区，会导致最新的Linux操作系统无法启动。

> 我是在摸索[从USB存储启动树莓派](../../../../../develop/raspberry_pi/boot_from_usb_storage_on_raspberry_pi)以及[使用tar方式备份和恢复系统](../../../../../os/linux/ubuntu/install/backup_and_restore_system_by_tar)、[使用tar包手工安装多重启动的ubuntu](../../../../../os/linux/ubuntu/install/deploy_multi_boot_ubuntu_from_tarball_manually)的实践中，逐步明白EFI启动的规律和原则。

# 参考

* [EFI System Partition](https://wiki.archlinux.org/index.php/EFI_System_Partition)
* [GNU Parted](https://wiki.archlinux.org/index.php/GNU_Parted)
* [Persistent block device naming](https://wiki.archlinux.org/index.php/persistent_block_device_naming)