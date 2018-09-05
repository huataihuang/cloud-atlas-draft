运行中的虚拟机，需要更新虚拟机驱动，通过将`.iso`文件附加到虚拟机上来实现

* 如果虚拟机没有定义CDROM设备

可以通过以下命令添加设备

```
virsh attach-disk <GuestName> /dev/sr0 hdc --type cdrom
```

或者指向ISO文件：

```
virsh attach-disk <GuestName> ~/virtio-win-0.1-22.iso hdc --type cdrom
```

```
virsh attach-disk <GuestName> sample.iso hdc --type cdrom --mode readonly
```

* 如果虚拟机已经定义了CDROM设备或者已经添加了iso文件，则通过xml文件来更新设备

```xml
<disk type='block' device='cdrom'>
  <driver name='qemu' type='raw'/>
  <target dev='hdc' bus='ide'/>
  <readonly/>
  <alias name='ide0-1-0'/>
  <address type='drive' controller='0' bus='1' unit='0'/>
</disk>
```

然后执行

```
virsh update-device <GuestName> guest-device.xml
```

# 参考

* [Attaching and updating a device with virsh](https://docs.fedoraproject.org/en-US/Fedora/18/html/Virtualization_Administration_Guide/sect-Attaching_and_updating_a_device_with_virsh.html)
* [APPENDIX A. USING VIRSH TO MOUNT A CD-ROM IMAGE ON AN INACTIVE DOMAIN](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/5/html/para-virtualized_windows_drivers_guide/appe-para-virtualized_windows_drivers_guide-using_virsh_to_mount_a_cd_rom_image_on_an_inactive_domain)
* [How to connect a cdrom device to a kvm/qemu domain (using command-line tools)?](https://serverfault.com/questions/373372/how-to-connect-a-cdrom-device-to-a-kvm-qemu-domain-using-command-line-tools)