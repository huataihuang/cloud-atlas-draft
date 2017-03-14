在[在CentOS中部署KVM](../startup/in_action/deploy_kvm_on_centos)介绍了使用`virtio`启动安装Windows的方法：

```
virt-install \
   --name=win2016desktop \
   --virt-type=kvm \
   --boot cdrom,hd \
   --os-type=windows \
   --network=default,model=virtio \
   --disk path=/var/lib/libvirt/images/win2016desktop.img,size=16,format=qcow2,bus=virtio,cache=none \
   --cdrom=/var/lib/libvirt/images/win2016.iso \
   --graphics vnc --ram=2048 \
   --vcpus=2
```

> 注意：由于没有找到在Windows 2016安装时关闭驱动签名校验功能的方法，所以最后还是采用了先安装`ide`模式的全虚拟化磁盘，安装完操作系统之后，关闭驱动签名校验功能，然后再安装`virtio`驱动。详细方法见下述。

# Windows 2016安装过程无法加载没有签名的virtio驱动

这里需要注意的是，Windows自身是没有携带`virtio`驱动的，所以此时安装选择目标磁盘时候会看不到虚拟磁盘：

![virtio初始安装windows找不到磁盘](../../../img/virtual/kvm/performance/windows_install_with_virtio_no_disk.png)

则点击`Load driver`加载驱动。

此时，由于`virsh-install`只加载了`/var/lib/libvirt/images/win2016.iso`作为CDROM，尚未加入驱动光盘。

尝试`fly`添加驱动镜像：

```
virsh attach-disk win2016desktop /var/lib/libvirt/images/virtio-win.iso hdb --type cdrom --mode readonly
```

但是发现cdrom和软盘设备不支持`hotplug`

```
error: Failed to attach disk
error: internal error: No device with bus 'ide' and target 'hdb'. cdrom and floppy device hotplug isn't supported by libvirt
```

> 参考 [Attaching and updating a device with virsh](https://docs.fedoraproject.org/en-US/Fedora/18/html/Virtualization_Administration_Guide/sect-Attaching_and_updating_a_device_with_virsh.html)

所以编辑一个`/var/lib/libvirt/images/virtio-iso.xml`配置文件内容如下，然后执行命令 `virsh update-device win2016desktop /var/lib/libvirt/images/virtio-iso.xml`

```
<disk type='file' device='cdrom'>
  <driver name='qemu' type='raw'/>
  <source file='/var/lib/libvirt/images/virtio-win.iso'/>
  <backingStore/>
  <target dev='hda' bus='ide'/>
  <readonly/>
  <alias name='ide0-0-0'/>
  <address type='drive' controller='0' bus='0' target='0' unit='0'/>
</disk>
```

> 这里将CDROM设备作为`hda`是因为使用`virsh-install`启动安装时设置的`--cdrom=/var/lib/libvirt/images/win2016.iso`对应的设备名是`hda`(这个配置文件内容是通过`virsh dumpxml win2016desktop`输出中摘取`cdrom`部分修改得到的)

此时在Windows安装界面中选择`browse`按钮，选择驱动光盘，再点击`OK`

![virtio初始安装windows找不到磁盘](../../../img/virtual/kvm/performance/windows_install_with_virtio_add_driver.png)

但是Windows安装程序会提示驱动没有包含签名错误`No signed device drivers were found.Make sure that the installation media contains the correct drivers, and then click OK`。

这个问题在Windows 2016安装中遇到，以前的Windows 2012等版本则没有驱动签名问题。

> [Windows Virtio Drivers](https://fedoraproject.org/wiki/Windows_Virtio_Drivers):These drivers are cryptographically signed with Red Hat's vendor signature. However they are not signed with Microsoft's WHQL signature.

参考 [Deploy Windows Server 2016 on Nutanix CE](http://www.nutanixpedia.com/p/deploy-windows-server-2016-on-nutanix-ce.html) 似乎驱动需要使用 Windows Virtio Drivers (0.1.126)，不过我原先下载的稳定版本virtio-win.iso恰好就是virtio-win-0.1.126.iso。我推测是因为0.1.126发布日期和Windows 2016发布时间接近，有可能社区尚未更新签名所以不能够被Windows 2016所支持。

改为尝试最新的[Latest virtio-win iso](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/latest-virtio/virtio-win.iso)但是依然失败。

# 在Windows中关闭驱动签名校验的方法

参考 [Top 2 Ways to Disable Driver Signature Enforcement on Windows 10/8.1/8/7/XP/Vista](http://www.drivethelife.com/windows-drivers/how-to-disable-driver-signature-enforcement-on-windows-10-8-7-xp-vista.html)

原来Windows有一个`test mode`可以用来关闭签名验证

> 参考[How to Disable Driver Signature Verification on 64-Bit Windows 8 or 10 (So That You Can Install Unsigned Drivers)](https://www.howtogeek.com/167723/how-to-disable-driver-signature-verification-on-64-bit-windows-8.1-so-that-you-can-install-unsigned-drivers/)

不过，这个方法是需要先安装好操作系统，然后通过命令 `bcdedit /set testsigning on` 来关闭驱动签名验证

```
BCDEDIT /Set LoadOptions DDISABLE_INTEGRITY_CHECKS
BCDEDIT /Set TESTSIGNING ON
```

> 不过，很不幸，测试在Windows安装过程中使用上述方法无效（因为系统尚未安装无法对磁盘中操作系统配置进行修改）。同时，由于我是使用KVM虚拟机，没有找到向远程VNC发送`F8`进入Advanced Boot方法，所以，最后采用普通IDE磁盘安装完操作系统再替换磁盘驱动的方法。见下述。

# 安装Windows virtio驱动

* 重新使用`IDE`磁盘模式安装操作系统

```
virt-install \
   --name=win2016desktop \
   --os-type=windows --os-variant=win2k12r2 \
   --boot cdrom,hd \
   --os-type=windows \
   --network bridge:virbr0 \
   --disk path=/var/lib/libvirt/images/win2016desktop.img,size=16 \
   --disk device=cdrom,path=/var/lib/libvirt/images/win2016.iso \
   --disk device=cdrom,path=/var/lib/libvirt/images/virtio-win.iso \
   --boot cdrom,hd \
   --graphics vnc --ram=4096 \
   --vcpus=2
```

当操作系统安装完成之后，我们可以通过向虚拟机田间virtio设备，使得Windows扫面并新增驱动。此时只要关闭掉驱动签名校验，就可以顺利安装上virtio驱动。详细步骤如下：

* 关闭Windows 驱动签名校验

在命令行按钮右击鼠标选择`run as administrator`，然后执行命令

```
bcdedit /set testsigning on
```

* 检查当前虚拟机磁盘情况

```
virsh qemu-monitor-command win2016desktop --hmp "info block"
```

显示

```
drive-ide0-0-0: removable=0 io-status=ok file=/var/lib/libvirt/images/win2016desktop.img ro=0 drv=qcow2 encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-ide0-0-1: removable=1 locked=0 tray-open=0 io-status=ok file=/var/lib/libvirt/images/en_windows_server_2016_x64_dvd_9327751.iso ro=1 drv=raw encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
drive-ide0-1-0: removable=1 locked=0 tray-open=0 io-status=ok file=/var/lib/libvirt/images/virtio-win.iso ro=1 drv=raw encrypted=0 bps=0 bps_rd=0 bps_wr=0 iops=0 iops_rd=0 iops_wr=0
```

* 生成虚拟机磁盘

```
cd /var/lib/libvirt/images
qemu-img create -f qcow2 win2016desktop-data.img 32G
```

* 动态向虚拟机添加`virtio`磁盘

```
virsh attach-disk win2016desktop --source /var/lib/libvirt/images/win2016desktop-data.img --target vdb --targetbus=virtio --persistent --driver qemu --subdriver qcow2
```

此时`virsh edit win2016desktop`可以看到添加了如下一段配置

```
<disk type='file' device='disk'>
  <driver name='qemu' type='qcow2' cache='none'/>
  <source file='/var/lib/libvirt/images/win2016desktop-data.img'/>
  <target dev='vdb' bus='virtio'/>
  <address type='pci' domain='0x0000' bus='0x00' slot='0x04' function='0x0'/>
</disk>
```

之后重启windows系统就会识别出新加的磁盘设备，此时Windows就会要求更新驱动，就可以安装对应的`virtio`驱动了。

* 增加`virtio`网卡设备

再次编辑`win2016desktop`配置，修改网络设备配置如下

将原先的N2000网卡设备配置

```
    <interface type='bridge'>
      <mac address='52:54:00:ae:a9:98'/>
      <source bridge='virbr0'/>
      <model type='rtl8139'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>
    </interface>
```

修改成virtio设备

```
    <interface type='network'>
      <mac address='52:54:00:03:b9:a4'/>
      <source network='default'/>
      <model type='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x03' function='0x0'/>
    </interface>
```

* 重启操作系统，并打开`Device Manager`，此时可以看到系统中有3个没有识别的设备

![windows Device Manager](../../../img/virtual/kvm/performance/windows_install_with_virtio_update.png)

这3个设备就是`virtio`类型的网卡、内存Ballon、磁盘设备

* 选择升级驱动，然后扫描`virtio`驱动所在光盘，就可以更新驱动（因为已经关闭了驱动签名校验，所以可以升级）

![virtio安装驱动](../../../img/virtual/kvm/performance/windows_install_with_virtio_update_trust.png)

将上述3个`virtio`设备驱动安装完成之后，可以重启一次系统确认设备工作正常。

* 再次修改`win2016desktop`，将默认的系统磁盘从普通的`IDE`类型修改成`virtio`类型，这样就可以提高系统磁盘性能

将

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='/var/lib/libvirt/images/win2016desktop.img'/>
      <target dev='hda' bus='ide'/>
      <address type='drive' controller='0' bus='0' target='0' unit='0'/>
    </disk>
```

修改成

```
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2' cache='none'/>
      <source file='/var/lib/libvirt/images/win2016desktop.img'/>
      <target dev='vda' bus='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x04' function='0x0'/>
    </disk>
```

再次重启后，Windows系统使用的磁盘设备和网卡设备都会替换成`virtio`，此时网络和磁盘性能将有很大提高。