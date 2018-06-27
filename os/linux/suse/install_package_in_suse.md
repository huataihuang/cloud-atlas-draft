# 使用 Zypper¶

Zypper 是一个命令行包管理器，用于安装、更新和删除包及管理安装源。

执行 Zypper 最简单的方式是，键入其名称后跟一个命令。例如，将所有需要的增补程序应用于系统类型：

```
zypper patch
```

`--non-interactive` 表示运行命令时不询问任何问题（自动应用默认回答）：

```
zypper --non-interactive patch
```

多数 Zypper 命令都有 `dry-run` 选项，它模拟给定的命令。它可用于测试。

```
zypper remove --dry-run MozillaFirefox
```

## 使用 Zypper 安装和删除软件

```
zypper install <package_name>
zypper remove <package_name>
```

以下命令将安装名称以“Moz”开头的所有包。使用通配符要小心，特别是删除包的时候。

```
zypper install 'Moz*'
```

要同时安装和删除包，请使用 `+/-` 修饰符。要同时安装 emacs 并删除 vim，请使用：

```
zypper install emacs -vim
```

如果要安装源代码，则使用`source-install`指令

```
zypper source-install <package_name>
```

如果要默认选项来答复`zypper`的交互，SUSE使用了一个非常反直觉的`-n`参数来表示`non-interactive`模式，所以如果想直接安装而不需要输入`y`，则使用

```
zypper -n install <package_name>
```

如果要搜索软件包，可以使用通配符

```
zypper search usb*
```

此外可以检查软件包的详情：

```
zypper info usbutils
```

## 安装更新

如果某个安装源只包含新包，但未提供增补程序，则 `zypper patch` 不会产生任何作用。要使用新的可用版本更新所有安装的包，请使用：

```
zypper update
```

要更新个别包，请用更新或安装命令指定包：

```
zypper update <package_name>
zypper install <package_name>
```

获取所有新的可安装包的列表：

```
zypper list-updates
```

* 系统级别的完整发行版升级

```
zypper dup
```

## 安装补丁

可以使用zypper安装系统的补丁：

```
zypper patches
```

也可以安装指定的补丁：

```
zypper patch <patch name>
```

# 锁定一个特殊包

如果要避免某个软件包被系统更新，可以锁定这个软件包，此时就不能删除或更新这个软件包：

```
zypper al ypbind
```

这里的`al`命令表示`Add Lock`

要列出已经被锁定的软件包，则使用`ll`命令，表示`List Locks`

```
zypper ll
```

显示输出类似

```
# | Name   | Type    | Repository
--+--------+---------+-----------
1 | ypbind | package | (any)
```

要移除锁定使用`rl`表示`Remove Lock`

```
zypper rl ypbind
```

# 管理Zypper软件仓库

要查看当前的安装源，请输入：

```
zypper lr -u
```

如果没有源，会提示

```
Warning: No repositories defined.
Use the 'zypper addrepo' command to add one or more repositories.
```

要显示完整的仓库RUI，使用如下命令：

```
zypper lr --uri
```

有关SuSE的软件仓库列表请参考 [Package repositories](https://en.opensuse.org/Package_repositories) ，添加方法可以参考 [20 Zypper Command Examples to Manage Packages on SUSE Linux](https://www.thegeekstuff.com/2015/04/zypper-examples/)

例如，对于openSUSE 42.3版本（查看版本的方法是 `cat /etc/os-release`），则使用如下方法：

```
zypper addrepo --check --refresh --name "Open Source Software - OSS" http://download.opensuse.org/distribution/leap/42.3/repo/oss/ "OSS"
```

添加安全更新仓库

```
zypper addrepo --check --refresh --name "OSS  Update" http://download.opensuse.org/update/leap/42.3/oss/ "Update"
```

添加源代码仓库

```
zypper addrepo --check --refresh --name "OSS  Source" http://download.opensuse.org/source/distribution/leap/42.3/repo/oss/ "Src-OSS"
```

添加Debug

```
zypper addrepo --check --refresh --name "OSS  Debug" http://download.opensuse.org/debug/distribution/leap/42.3/repo/oss/ "Debug"

zypper addrepo --check --refresh --name "OSS  Update Debug" http://download.opensuse.org/debug/update/leap/42.3/oss/ "Update-Debug"
```

不过，在国内访问openSUSE的官方网站似乎总是被断开，所以采用163镜像网站：

```
zypper addrepo --check --refresh --name "Open Source Software - OSS" http://mirrors.163.com/openSUSE/distribution/leap/42.3/repo/oss/ "OSS"

zypper addrepo --check --refresh --name "OSS  Update" http://mirrors.163.com/openSUSE/update/leap/42.3/oss/ "Update"

zypper addrepo --check --refresh --name "OSS  Source" http://mirrors.163.com/openSUSE/source/distribution/leap/42.3/repo/oss/ "Src-OSS"

zypper addrepo --check --refresh --name "OSS  Debug" http://mirrors.163.com/openSUSE/debug/distribution/leap/42.3/repo/oss/ "Debug"

zypper addrepo --check --refresh --name "OSS  Update Debug" http://mirrors.163.com/openSUSE/debug/update/leap/42.3/oss/ "Update-Debug"
```

> 注意：SUSE软件仓库配置位于 `/etc/zypp/repos.d` 目录下。

## 重命名软件仓库

```
zypper renamerepo mylocalrepo LOCALRPM-Repo
```

## 删除仓库

```
zypper removerepo LOCALRPM-Repo
```

## 备份仓库

```
zypper lr --export /var/tmp/backup.repo
```

## 禁用和激活仓库

* 禁用

```
zypper modifyrepo -d Mozillarepo
```

* 激活

```
zypper modifyrepo -e Mozillarepo
```

## 刷新仓库

如果仓库长时间不同步，可以手工刷新

```
zypper refresh Mozillarepo
```

要设置自动刷新选项：

```
zypper modifyrepo --refresh mylocalrepo
```

## 创建一个本地软件仓库

可以在服务器上为一个本地目录创建一个本地软件仓库

```
zypper addrepo <Path_to_dir> <Repo Name>
```

例如：

```
zypper addrepo /var/stormgt/dsminst mylocalrepo
```

然后就可以搜索本地仓库

```
zypper search --repo mylocalrepo
```

# 参考

* [使用命令行工具管理软件](https://www.suse.com/zh-cn/documentation/sles11/singlehtml/book_sle_admin/cha.sw_cl.html)
* [20 Zypper Command Examples to Manage Packages on SUSE Linux](https://www.thegeekstuff.com/2015/04/zypper-examples/)