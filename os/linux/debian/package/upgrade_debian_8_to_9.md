为什么要升级Debian 8 Jessie 到 Debian 9 Stretch：

> This new release of Debian again comes with a lot more software than its predecessor jessie; the distribution includes over 15346 new packages, for a total of over 51687 packages. Most of the software in the distribution has been updated: over 29859 software packages (this is 57% of all packages in jessie). Also, a significant number of packages (over 6739, 13% of the packages in jessie) have for various reasons been removed from the distribution.
SOURCE: debian.org

本文实践是在云计算Vultr平台升级VPS的经验记录。

# 准备

对于Debian这样的Linux发行版，具有很强的鲁棒性，能够实现跨大版本升级。但是，第三方软件有可能存在异常并且可能阻碍版本升级。所以在升级前，建议将第三方仓库暂时移除（关闭）。

系统安装的软件包数量越少（越精简）则升级成功率越高。

* 检查当前第三方源：

```
aptitude search '~o'
```

以上命令将列出所有不属于标准软件仓库的软件包，建议将非标准软件移除。

> **`在升级前务必备份所有数据和配置文件。`**

**`警告！`**

在Debian 9 Stretch中MariaDB替代了MySQL。这将引入一个新的数据库二进制数据文件格式，和原先的Debian 8 Jessie的数据库格式不兼容。在升级过程中，数据库将自动升级。但是，如果升级后数据库运行存在问题，就不能回滚！所以，在升级前务必对数据库进行完整备份！！！

# Jessie完整升级

在大版本升级前，先完成一次当前版本Debian Jessie的系统升级：

```
apt-get update
apt-get upgrade
apt-get dist-upgrade
```

如果以上步骤都顺利完成，则对现有安装软件进行数据健康和移植性检查

```
dpkg -C
```

如果没有报错，则检查是否存在held back的软件包：

```
apt-mark showhold
```

* 修改软件仓库源

然后使用命令`apt edit-sources`或使用`vim`编辑`/etc/apt/sources.list`文件，简单地将`jessie`关键字修改成`stretch`

```
FROM JESSIE
deb http://httpredir.debian.org/debian jessie main
deb http://httpredir.debian.org/debian jessie-updates main
deb http://security.debian.org jessie/updates main
TO STRETCH
deb http://httpredir.debian.org/debian stretch main
deb http://httpredir.debian.org/debian stretch-updates main
deb http://security.debian.org stretch/updates main
```

上述手工编辑方法也可以通过`sed`完成（推荐此方法）：

```
sed -i 's/jessie/stretch/g' /etc/apt/sources.list
```

* 上述软件仓库源修订以后，就可以使用以下命令进行升级软件包索引

```
apt-get update
```

## 模拟升级到Debian Stretch

在实际开始大版本升级之前，可以使用`apt`命令查看有哪些包已经安装，并且将在大版本升级过程中被更新或删除：

```
apt list --upgradable
```

## 升级到Debian Stretch

```
apt-get upgrade
apt-get dist-upgrade
```

完成之后，系统就升级到了Stretch版本（Debian 9）

# 更新到Debian Stretch的软件仓库

现在开始正式的系统完全升级，首先将软件包索引同步成新Debian Stretch源。这个步骤是通过修改`/etc/apt/source.list`文件，包含Debian stretch软件包仓库。

首先备份原先的`/etc/apt/sources.list`

```

```

# 参考

* [How to upgrade Debian 8 Jessie to Debian 9 Stretch](https://linuxconfig.org/how-to-upgrade-debian-8-jessie-to-debian-9-stretch)