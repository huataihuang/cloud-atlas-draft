＃ Python和libvirt

使用Python编写KVM监控脚本，验证libvirt服务的脚本如下

```
#!/usr/bin/python
# -*- coding: utf-8 -*-

g_msg = []

def main():
    try:
        import libvirt
        conn=libvirt.openReadOnly("qemu:///system");
        conn.close()
        g_msg.append("libvirtd ok")
    except:
        logging.error(traceback.format_exc())
        g_msg.append("connect libvirtd error")

    print g_msg

if __name__ == '__main__':
    main()
```

执行出现异常

```
libvirt: XML-RPC error : authentication failed: polkit: Error checking for authorization org.libvirt.unix.monitor: GDBus.Error:org.freedesktop.PolicyKit1.Error.Failed: Action org.libvirt.unix.monitor is not registered
```

> 可以用交互命令`python`验证

```
>>> import libvirt
>>> conn=libvirt.open("qemu:///system")
libvirt: XML-RPC error : authentication failed: polkit: Error checking for authorization org.libvirt.unix.manage: GDBus.Error:org.freedesktop.PolicyKit1.Error.Failed: Action org.libvirt.unix.manage is not registered
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/usr/local/python/lib/python2.7/site-packages/libvirt.py", line 257, in open
    if ret is None:raise libvirtError('virConnectOpen() failed')
libvirt.libvirtError: authentication failed: polkit: Error checking for authorization org.libvirt.unix.manage: GDBus.Error:org.freedesktop.PolicyKit1.Error.Failed: Action org.libvirt.unix.manage is not registered
```

或者 `python -c 'import libvirt; conn=libvirt.openReadOnly("qemu:///system");'`

# 尝试解决的方法

参考 [UNIX socket PolicyKit auth](http://libvirt.org/auth.html#ACL_server_polkit) 在 `/etc/polkit-1/localauthority/50-local.d/`目录下设置一个`50-org.libvirt.unix.manage.pkla`

```
[libvirt Management Access]
Identity=unix-group:admin
Action=org.libvirt.unix.manage
ResultAny=yes
ResultInactive=yes
ResultActive=yes
```

> 这里 `Identity` 可以使用 `unix-group`或者`unix-user`，分别对应用户组和用户名

然后需要重启一下 polkit

```
systemctl restart polkit.service
```

报错

```
PolicyKit daemon disconnected from the bus.
We are no longer a registered authentication agent.
```

另一种方法： Fedora 18中，在 `/etc/polkit-1/rules.d` 目录下添加 `10.virt.rules`

```
polkit.addRule(function(action, subject) {
        polkit.log("action=" + action);
        polkit.log("subject=" + subject);
        var now = new Date();
        polkit.log("now=" + now)
        if ((action.id == "org.libvirt.unix.manage" || action.id == "org.libvirt.unix.monitor") && subject.isInGroup("virt")) {
        return polkit.Result.YES;
        }
        return null;
        });
```

然后重启

```
systemctl restart polkit.service
```

不过，我发现会导致 `sudo bash -c "sudo su -"` 非常缓慢

---

[Using polkit](https://wiki.archlinux.org/index.php/Libvirt#Using_polkit)

```
/* Allow users in kvm group to manage the libvirt
daemon without authentication */
polkit.addRule(function(action, subject) {
    if (action.id == "org.libvirt.unix.monitor" &&
        subject.isInGroup("admin")) {
            return polkit.Result.YES;
    }
});
```

# 实际解决方法

采用 [org.libvirt.unix.policy](https://apt-browse.org/browse/ubuntu/precise/main/i386/libvirt-bin/0.9.8-2ubuntu17/file/usr/share/polkit-1/actions/org.libvirt.unix.policy) 这个文件，存放到 `/usr/share/polkit-1/actions/org.libvirt.unix.policy`

```
<!DOCTYPE policyconfig PUBLIC
 "-//freedesktop//DTD PolicyKit Policy Configuration 1.0//EN"
 "http://www.freedesktop.org/standards/PolicyKit/1.0/policyconfig.dtd">

<!--
Policy definitions for libvirt daemon

Copyright (c) 2007 Daniel P. Berrange <berrange redhat com>

libvirt is licensed to you under the GNU Lesser General Public License
version 2. See COPYING for details.

NOTE: If you make changes to this file, make sure to validate the file
using the polkit-policy-file-validate(1) tool. Changes made to this
file are instantly applied.
-->

<policyconfig>
    <action id="org.libvirt.unix.monitor">
      <description>Monitor local virtualized systems</description>
      <message>System policy prevents monitoring of local virtualized systems</message>
      <defaults>
        <!-- Any program can use libvirt in read-only mode for monitoring,
             even if not part of a session -->
        <allow_any>yes</allow_any>
        <allow_inactive>yes</allow_inactive>
        <allow_active>yes</allow_active>
      </defaults>
    </action>

    <action id="org.libvirt.unix.manage">
      <description>Manage local virtualized systems</description>
      <message>System policy prevents management of local virtualized systems</message>
      <defaults>
        <!-- Only a program in the active host session can use libvirt in
             read-write mode for management, and we require user password -->
        <allow_any>no</allow_any>
        <allow_inactive>no</allow_inactive>
        <allow_active>auth_admin_keep</allow_active>
      </defaults>
    </action>
</policyconfig>
```

然后重启

```
# sudo systemctl restart polkit.service
# python -c 'import libvirt; conn=libvirt.openReadOnly("qemu:///system");'
```

即解决这个问题

＃ 参考

* [How do I prevent virt-manager from asking for the root password?](http://superuser.com/questions/548433/how-do-i-prevent-virt-manager-from-asking-for-the-root-password)
* [Using polkit](https://wiki.archlinux.org/index.php/Libvirt#Using_polkit)

* [Scripting KVM with Python, Part 1: libvirt](http://www.ibm.com/developerworks/library/os-python-kvm-scripting1/)

* [Configuring polkit in Fedora 18 to access virt-manager](https://goldmann.pl/blog/2012/12/03/configuring-polkit-in-fedora-18-to-access-virt-manager/)
* [auth libvirt using polkit in fedora 18](https://niranjanmr.wordpress.com/2013/03/20/auth-libvirt-using-polkit-in-fedora-18/)