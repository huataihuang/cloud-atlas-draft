> 本文实践是在FreeBSD 11上完成，执行命令可能和早期版本不同！

# 使用Package

FreeBSD提供了`sysinstall`工具可以安装、删除和列出可用的以及已经安装的预编译软件包。

## 使用`pkg`

* `pkg`安装软件包

刚安装完的FreeBSD 11操作系统，`pkg`软件包管理工具其实也没有安装，但是你直接执行`pkg`命令的时候，系统会提示

```bash
The package management tool is not yet installed on your system.
Do you want to fetch and install it now? [y/N]:
```

此时答复`y`就会开始安装`pkg`包管理工具

```
Bootstrapping pkg from pkg+http://pkg.FreeBSD.org/FreeBSD:11:amd64/latest, please wait...
Verifying signature with trusted certificate pkg.freebsd.org.2013102301... done
Installing pkg-1.8.5_1...
Extracting pkg-1.8.5_1: 100%
pkg: not enough arguments
Usage: pkg [-v] [-d] [-l] [-N] [-j <jail name or id>|-c <chroot path>|-r <rootdir>] [-C <configuration file>] [-R <repo config dir>] [-o var=value] [-4|-6] <command> [<args>]

For more information on available commands and options see 'pkg help'.
```

安装完成`pkg`包管理工具之后，就可以使用`pkg`来进一步安装需要的软件工具。例如，这里我们安装`lsof`工具

```bash
pkg install lsof
```

此时提示更新软件仓库索引，然后提示是否安装指定版本的`lsof`软件包，答复`y`就开始下载安装

```bash
Updating FreeBSD repository catalogue...
Fetching meta.txz: 100%    944 B   0.9kB/s    00:01
Fetching packagesite.txz: 100%    5 MiB   2.9MB/s    00:02
Processing entries: 100%
FreeBSD repository update completed. 25314 packages processed.
Updating database digests format: 100%
The following 1 package(s) will be affected (of 0 checked):

New packages to be INSTALLED:
	lsof: 4.90.b,8

108 KiB to be downloaded.

Proceed with this action? [y/N]:
```

安装完成后，就可以看到`/usr/local/bin/lsof`工具

* `pkg`列出安装软件包信息描述`pkg info`

```bash
pkg info lsof
```

显示信息

```
lsof-4.90.b,8
Name           : lsof
Version        : 4.90.b,8
Installed on   : Wed Jun 22 03:31:42 2016 CST
Origin         : sysutils/lsof
Architecture   : freebsd:11:x86:64
Prefix         : /usr/local
Categories     : sysutils
Licenses       : lsof
Maintainer     : ler@lerctr.org
WWW            : http://people.freebsd.org/~abe/
Comment        : Lists information about open files (similar to fstat(1))
Annotations    :
	repo_type      : binary
	repository     : FreeBSD
Flat size      : 229KiB
Description    :
Lsof (LiSt Open Files) lists information about files that are open by the
running processes.  An open file may be a regular file, a directory, a block
special file, a character special file, an executing text reference, a
library, a stream or a network file (Internet socket, NFS file or Unix domain
socket).

See also fstat(1) in the base system.

WWW: http://people.freebsd.org/~abe/
```

* `pkg`检查软件包版本

```bash
pkg version lsof
```

显示输出

```bash
lsof-4.90.b,8                      =
pkg-1.8.5_1                        =
```

* `pkg`删除软件包

```bash
pkg delete lsof
```

* `pkg`升级整个系统

```bash
pkg upgrade
```

# 使用Ports Collection

## `portsnap`

`Ports Collection`是整个系统的源代码的Makefile，补丁和描述文件，如果在安装操作系统的时候没有选择安装`ports`，则可以通过`portsnap`先下载一个`Ports`快照

```bash
portsnap fetch
```

此时压缩的`Ports`快照被下载到`/var/db/portsnap`目录下。

然后，如果是第一次运行Portsnap，还需要将快照释放到`/usr/ports`目录下

```bash
portsnap extract
```

此时，对于已经安装好的`/usr/ports`，需要更新的话，执行如下命令

```bash
portsnap update
```

> 注意：如果安装操作系统的时候已经安装过`ports`，可以不使用`portsnap`，此时可以使用`portupgrade`工具来更新`ports`（参考下文）

## `portupgrade`工具

`portupgrade`工具是设计用来简化升级已经安装的`port`操作

```bash
cd /usr/ports/ports-mgmt/portupgrade
make install clean
```

安装完成后，请先使用`pkgdb check`命令来扫描已经安装的`port`的列表，并修正所报告的不一致。

升级系统所有过时的ports

```bash
portupgrade -a
```

> 需要安装内核源代码，提示：

```bash
** Port marked as IGNORE: sysutils/lsof:
	requires kernel sources
```

解决方法参考 [How do you install the FreeBSD10 kernel sources?](http://unix.stackexchange.com/questions/204956/how-do-you-install-the-freebsd10-kernel-sources) 和 [How To Customize and Recompile Your Kernel on FreeBSD 10.1](https://www.digitalocean.com/community/tutorials/how-to-customize-and-recompile-your-kernel-on-freebsd-10-1)

* 手工下载源代码（假设是`10.3-stable`版本）

```bash
fetch ftp://ftp.freebsd.org/pub/FreeBSD/releases/amd64/10.3-RELEASE/src.txz
tar -C / -xzvf src.txz
```

如果如我安装的是`11.0-alpha4`则`fetch ftp://ftp.freebsd.org/pub/FreeBSD/snapshots/amd64/11.0-ALPHA4/src.txz`

> 要加快下载速度可以使用`aria2`多线程下载工具，可以对web下载并发多任务 `aria2c -x10 http://SERVER-IP/src.txz`

* 使用SVN下载源代码

```bash
pkg install devel/subversion
sudo svn co https://svn0.us-east.FreeBSD.org/base/stable/10 /usr/src
```

如果希望每个升级前操作得到确认，则添加`-i`参数，也就是命令 `portupgrade -ai`

如果要升级指定的应用程序而不是所有的port，则使用`portupgrade pkgname`。如果`portupgrade`应首先升级指定的应用程序的话，则使用`-R`参数：

```bash
portupgrade -R firefox
```

要使用**预编译**的package而不是ports来进行安装，则使用`-P`参数。此时，`portupgrade`会搜索`PKG_PATH`指定的本地目录，没有找到，就会从远程站点下载。如果本地没有找到，并且远程站点也没有成功下载预编译包，则`portupgrade`就使用`ports`。如果要禁止使用`port`，可以自定`-PP`

```bash
portupgrade -PP gnome2
```

如果只想下载`distfiles`（或者指定了`-P`就是packages）而不想构建或安装任何东西，可以使用`-F`参数。

## `Portmanager`来升级Ports

`Portmanager`是另一个用来简化已经安装port升级操作的工具

```
cd /usr/ports/ports-mgmt/portmanager
make install clean
```

升级所有的已安装`port`

```bash
portmanager -u
```

如果要交互确认则使用`-ui`参数。

`portmanager`也可以用来安装新的ports，并且和通常的`make install clean`命令不同，会联编和安装所选择`port`之前所有依赖包：

```bash
portmanager x11/gnome2
```

如果所选择的port依赖有问题，也可以使用`portmanager`来以正确的顺序重新构建它们。完成之后，有问题的`port`也将被重新构建。

```bash
portmanager graphics/gimp -f
```

# Ports 和磁盘空间

使用 Ports 套件会最终用完磁盘空间。 在通过 ports 联编和安装软件之后，应记得清理临时的 work 目录， 其方法是使用 make clean 命令。 可以使用下面的命令来清理整个 Ports 套件：

```bash
portsclean -C
```

随着时间的推移， 可能会在 distfiles 目录中积累下大量源代码文件。 可以手工删除这些文件， 也可以使用下面的命令来删除所有 port 都不引用的文件：

```bash
portsclean -D
```

除此之外， 也可以用下列命令删去目前安装的 port 没有使用的源码包文件：

```bash
portsclean -DD
```

> 这个 portsclean 工具是 portupgrade 套件的一部分

**我使用`portupgrade`管理软件包**

# 参考

* [Installing Applications: Packages and Ports](https://www.freebsd.org/doc/handbook/pkgng-intro.html)