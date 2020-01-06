# 驱动模块安装

通常硬件驱动的内核模块存放在`/lib/modules/$(uname -r)/kernel/drivers/`目录下。

如果要加载驱动`foo`则执行如下命令

```
modprobe foo
```

如果要加载时候提供详细信息（显示加载的模块完整路径），则使用`-v`参数。

# 通过udev自动加载模块

现代的Linux操作系统使用了`udev`可以自动处理内核模块，所以通常不需要用配置文件来加载内核模块，因为udev会自动处理。

# 通过配置文件加载内核模块

如果udev没有自动加载你所需要的内核模块，可以采用配置文件来实现。内核配置文件位于`/etc/modules-load.d/`目录。例如，要加载kvm模块，则创建`/etc/modules-load.d/kvm.conf`内容如下：

```
kvm
kvm_intel
```

# 通过脚本加载自定义模块

在操作系统重启后，要持久化/自动加载内核模块，需要设置一个脚本来完成，例如，如果需要加载`nf_conntrack_pptp`模块（`netfilter`使用），则在 `/etc/sysconfig/modules` 目录下创建一个可执行的 `nf_conntrack_pptp.modules`，然后添加如下内容

```bash
#!/bin/sh
exec /sbin/modprobe nf_conntrack_pptp  >/dev/null 2>&1
```

> 注意：有时候系统为了阻止某些内核模块自动加载，会使用一个[Blacklisting a Module](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/blacklisting_a_module)的配置文件`/etc/modprobe.d/blacklist.conf`，所以操作系统启动后如果没有按照预期加载某个需要的内核模块，请检查该文件：

```
blacklist <module_name>
```

# 参考

* [Howto: Linux Add or Remove a Linux Kernel Modules / Drivers](https://www.cyberciti.biz/faq/add-remove-list-linux-kernel-modules/)