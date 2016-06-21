# ACPI支持

FreeBSD对acpi支持不佳，但是对TinkPad支持较好，在`/boot/loader.conf`中添加

```bash
acpi_video_load="YES"
acpi_ibm_load="YES"
```

# `/boot/loader.conf`配置

> 前三行是操作系统安装添加

```bash
kern.geom.label.disk_ident.enable="0"
kern.geom.label.gptid.enable="0"
zfs_load="YES"

#boot_verbose="-v"        # provide more dmesg information
autoboot_delay="1"        # Set wait time to 1 second
loader_logo="beastie"     # The color logo of FreeBSD
cuse4bsd_load="YES"

############################
## Load necessary modules ##
############################
cpuctl_load="YES"         # CPU Throttling 
coretemp_load="YES"       # Thermal Monitoring
#linprocfs_load="YES"      # Linux proc
#linsysfs_load="YES"       # Linux sysfs
acpi_ibm_load="YES"       # acpi for IBM ThinkPad
acpi_video_load="YES"     # ACPI Video Extensions driver
snd_hda_load="YES"        # sound card, comment out if in kernel
speaker_load="YES"        # console speaker device driver

#####################
### Bluetooth USB ###
#####################
#ubtbcmfw_load="YES       # Firmware loader for Broadcom Bluetooth 
#ng_ubt_load="YES"        # Bluetooth driver

################
### Wireless ###
################
wlan_scan_ap_load="YES"   # Wireless 
wlan_scan_sta_load="YES"  # Wireless 
if_ath_load="YES"         # Internal LAN module
if_ath_pci_load="YES"     # For Thinkpad X61
wlan_wep_load="YES"
wlan_ccmp_load="YES"
wlan_tkip_load="YES"

####################
## SD card reader ##
####################
#sdhci_load="YES"
#mmcsd_load="YES"
#mmc_load="YES"

##########################
### End of loader.conf ###
##########################
```

# 参考

* [Thinkpad 笔记本电脑上的 FreeBSD 内核](https://wiki.freebsdchina.org/doc/k/kernel)