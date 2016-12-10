默认情况下VNC采用的是动态密码，只有很短的有效期。今天遇到一个需要排查故障，需要访问vnc，所以准备设置一个持久化的密码。

# 手工设置vnc密码

* 首先获取VM id 和现实端口数据

```
vdsClient -s 0 list
```

如果是控制节点和计算节点分离的，则需要连接到控制节点上处理，`vdsClient -s SERVER_IP`

* 设置VNC密码

```
vdsClient -s 0 setVmTicket <vmid> <password> 0 keep
```

* 连接VNC

```
vncviewer <OVIRT_NODE_IP>:<displayPort>
```

# 如何使得密码更长时间

登陆计算节点服务器，使用`virsh edit <dom_id>`可以看到，原来`oVirt`是通过设置每个VNC密码的国旗时间来实现的

例如

```
        <graphics type='vnc' port='-1' autoport='yes' keymap='en-us' passwd='PASSWORD' passwdValidTo='2015-11-05T03:20:57'>
```

`oVirt`应该是通过定时修改vnc的密码来实现动态认证的，可以通过`virsh dumpxml`来查看vnc实时密码。另外，可以尝试`virsh edit dom_id`，将`passwdValidTo='2015-11-05T03:20:57`修改更长时间。完成后，可能需要重启一次`libvirtd`，应该能够延长时间。

> 如果上述方法不能生效，例如，我发现在 `virsh edit <dom_id>` 编辑保存了虚拟机的配置后，照理应该即时生效。但是遇到的情况是，`virsh edit`显示的是更改后的配置，但是`virsh dumpxml`显示的却是修改前的原始配置，结果并没有生效。最后还是采用先 `virsh edit` 编辑后保存到`/tmp`目录下临时文件，将这个临时文件复制出来作为定义和启动虚拟机的xml文件。然后通过`virsh shutdown`先停止虚拟机，然后用`virsh undefine`命令删除掉虚拟机定义，最后用现前保存过的虚拟机xml配置再次启动 `virsh start myhost.xml` ，这样才使得配置的vnc密码生效。

# VNC安全连接

默认VNC只监听回环地址，所以外部不能直接访问，需要通过SSH和tunneling方式访问guest的VNC控制台，以下是默认的VNC的libvirt XML配置：

```
<graphics type='vnc' port='-1' autoport='yes'/>
```

通过配置vnc监听地址`0.0.0.0`可以使得VNC监听在主机的所有接口，这样能够被外部网络访问：

```
<graphics type='vnc' port='-1' autoport='yes' listen='0.0.0.0'/>
```
再进一步，对于访问可以设置VNC访问密码

```
<graphics type='vnc' port='-1' autoport='yes' listen='0.0.0.0' passwd='PASSWORD'/>
```

> 参考 [Adjusting VNC Console Access via Libvirt XML](http://blog.scottlowe.org/2013/09/10/adjusting-vnc-console-access-via-libvirt-xml/)

参考 [Viewing a VM Guest with VNC](https://www.suse.com/documentation/sles11/book_kvm/data/cha_qemu_running_vnc.html)：VNC支持密码，使用x509认证，使用SASL认证，或者在QEMU命令中结合这些认证方法。

# 参考

* [Connect to Guest Display](https://www.ovirt.org/documentation/how-to/guest-console/connect-to-guest-display/)
* [Viewing a VM Guest with VNC](https://www.suse.com/documentation/sles11/book_kvm/data/cha_qemu_running_vnc.html)
* [KVM Virtualization: Start VNC Remote Access For Guest Operating Systems](https://www.cyberciti.biz/faq/linux-kvm-vnc-for-guest-machine/)
* [Adjusting VNC Console Access via Libvirt XML](http://blog.scottlowe.org/2013/09/10/adjusting-vnc-console-access-via-libvirt-xml/)
* [Displaying the remote KVM VNC console using any VNC client](http://www.ibm.com/support/knowledgecenter/linuxonibm/liaat/liaatkvmsecvncclient.htm)