# 简介

pacman软件包管理器是 Arch Linux 的一大亮点。它将一个简单的二进制包格式和易用的构建系统结合了起来。不管软件包是来自官方的 Arch 库还是用户自己创建，pacman 都能方便地管理。

pacman 通过和主服务器同步软件包列表来进行系统更新。这种服务器/客户端模式可以使用一条命令就下载或安装软件包，同时安装必需的依赖包。

pacman 用 C 语言编写，使用tar打包格式。

> 本文根据自己的常用需求摘选了官方帮助文件，方便自己日常操作。

# 安装软件包

> 已安装软件的可选依赖时可以使用`pacman -Si` ，得到关于可选依赖的简短描述。

> `警告`： 在Arch下安装软件包时，未更新系统前，**`不要`**更新软件包数据库（例如，可能出现某软件包不再出现在官方库）。操作时，应使用`pacman -Syu package_name`, 而不要使用（`pacman -Sy package_name`），否则可能会有依赖问题。

## 安装指定包

安装或者升级单个软件包，或者一列软件包（包含依赖包），使用如下命令：

```
pacman -S package_name1 package_name2 ...
```

用正则表达式安装多个软件包

```
pacman -S $(pacman -Ssq package_regex)
```

安装多个含有相似名称的软件包，而并非整个包组或全部匹配的软件包； 例如，plasma:

```
pacman -S plasma-{desktop,mediacenter,nm}
```

## 安装包组

* 一些包属于一个可以同时安装的软件包组

```
pacman -S gnome
```

* 想要查看哪些包属于 gnome 组，运行：

```
pacman -Sg gnome
```

## 删除软件包

* 删除单个软件包，保留其全部已经安装的依赖关系

```
pacman -R package_name
```

* 删除指定软件包，及其所有没有被其他已安装软件包使用的依赖关系：

```
pacman -Rs package_name
```

# 升级

* 更新`pacman`数据库

```
pacman -Sy
```

* 通过一个`pacman`命令就可以升级整个系统

```
pacman -Syu
```

遇到一个冲突文件

```
error: failed to commit transaction (conflicting files)
ca-certificates-utils: /etc/ssl/certs/ca-certificates.crt exists in filesystem
Errors occurred, no packages were upgraded.
```

在 https://bugs.archlinux.org/task/53217 提供了两种解决方法：

  * 方法一：

```
pacman -Syu --ignore ca-certificates-utils
pacman -S --force ca-certificates-utils
```

  * 方法二

```
pacman -Syu --ignore ca-certificates-utils
rm /etc/ssl/certs/ca-certificates.crt
pacman -S ca-certificates-utils
```

# 查询包数据库

pacman 使用 `-Q` 参数查询本地软件包数据库。参见：

```
pacman -Q --help
```

使用 `-S` 参数来查询远程同步的数据库。参见：

```
pacman -S --help
```

按文件名查找软件库：

```
pacman -Fs string1 string2 ...
```

显示软件包的详尽的信息：

```
pacman -Si package_name
```

查询本地安装包的详细信息：

```
pacman -Qi package_name
```

pacman 将下载的软件包保存在 /var/cache/pacman/pkg/ 并且不会自动移除旧的和未安装版本的软件包，因此需要手动清理，以免该文件夹过于庞大。

使用内建选项即可清除未安装软件包的缓存：

```
pacman -Sc
```

> `警告`:
>
> * 仅在确定当前安装的软件包足够稳定且不需要降级时才执行清理。`pacman -Sc`仅会保留软件包的当前有效版本，旧版本的软件包被清理后，只能从其他地方如 `Arch Linux Archive` 中获取了。
> * `pacman -Scc` 可以清理所有缓存，但这样 pacman 在重装软件包时就只能重新下载了。除非空间不足，否则不应这么做。



# 参考

* [Pacman (简体中文)](https://wiki.archlinux.org/index.php/Pacman_(简体中文))