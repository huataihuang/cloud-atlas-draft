操作系统的维护很重要的工作是升级补丁，以解决安全补丁，故障修复和性能提升问题。如果你的操作系统始终不升级，不管你是当初是如何精心选择一个强劲无比的Linux发行版本，终将被时间打败成一个满是漏洞、无法适应新应用程序的难维护的遗留系统。

运维线上海量服务器，系统管理员是很难去一一升级操作系统，这时需要采用自动化工具来完成。CentOS 6提供了 `yum-cron` 定时自动升级是一种解决方法（但是仍然需要精心涉及升级流程，避免自动升级导致的故障），早期的CentOS 5使用的工具名字是 `yumupdatesd`。

在激活自动升级之前，你需要确认系统中哪些软件包是不能自动升级的 - 例如你的应用依赖特定版本的软件包或库文件 - 将这些软件包排除出自动升级范围。你也可以设置自动升级工具每次email给你需要升级的软件包而不是直接自动升级掉软件包。( [Automatic package updates in CentOS 6](https://major.io/2012/09/21/automatic-package-updates-in-centos-6/) )

# 安装 `yum-cron`

使用以下命令安装

    yum install yum-cron -y

在 CentOS 7 上安装完成后，使用 `rpm -ql yum-cron` 可以看到安装了cron设置（配置文件和CentOS6不同），init脚本和配置文件

    /etc/cron.daily/0yum-daily.cron
    /etc/cron.hourly/0yum-hourly.cron
    /etc/yum/yum-cron-hourly.conf
    /etc/yum/yum-cron.conf
    /usr/lib/systemd/system/yum-cron.service
    /usr/sbin/yum-cron
    /usr/share/doc/yum-cron-3.4.3
    /usr/share/doc/yum-cron-3.4.3/COPYING
    /usr/share/man/man8/yum-cron.8

默认配置是立即下载所有可用更新并安装更新，报告将发送给系统的root用户。要修改这些设置，则修改 `/etc/sysconfig/yum-cron` ( [Automatic Updates in RHEL 6 and CentOS 6](http://samdoran.com/2013/05/17/automatic-updates-in-rhel-6-and-cent-os-6/) )

使用`systemctl list-unit-files`检查服务(CentOS 7中`systemctl`取代了`chkconfig`)

    systemctl list-unit-files

输出内容包括

    yum-cron.service                            enabled

默认配置文件是 `/etc/yum/yum-cron.conf` 可以看到默认配置项（在`CentOS 6`是配置文件`/etc/sysconfig/yum-cron`），和`CentOS 6`有所区别的是，`CentOS 7`开头提供不同的`yum upgrade` 选项，可以只更新安全补丁以及默认全更新。

例如只更新安全补丁，则设置 `update_cmd = security`

可以配置 `emit_via` 设置发送消息到标准输出或者发送邮件

> `默认的配置中，定时下载所有软件更新包，但不apply`，随机时间 360 s

# 验证服务

检查服务是否启动

    systemctl status yum-cron.service
    
如果没有启动，使用以下命令启动

    systemctl start yum-cron.service
 
# 参考

* [Enabling automatic updates in Centos 7 and RHEL 7](http://linuxaria.com/howto/enabling-automatic-updates-in-centos-7-and-rhel-7) - 有关CentOS 7的设置修改
* [Automatic Updates in RHEL 6 and CentOS 6](http://samdoran.com/2013/05/17/automatic-updates-in-rhel-6-and-cent-os-6/) - 有关CentOS 6的设置修改，可参考
* [Automatic package updates in CentOS 6](https://major.io/2012/09/21/automatic-package-updates-in-centos-6/)

