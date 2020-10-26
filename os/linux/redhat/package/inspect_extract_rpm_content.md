其实我们经常需要检查rpm包内容，或者抽取rpm包中文件使用(不完整安装软件包)，以下操作在一些内核安装等过程中经常使用，这里是作为整理汇总。

# 一句话

要解压缩rpm包，我们只需要工具 `rpm2cpio` 和 `cpio` ：

```bash
rpm2cpio ./packagecloud-test-1.1-1.x86_64.rpm | cpio -idmv
```

# rpm

rpm包实际上是在cpio归档文件头部添加了一个结构，软件包包含4个部分：

* 具备先导标记(magic number)的头部，标记这个文件是一个RPM包
* 用于验证软件包的签名
* 标记软件包内容信息的头部，包含版本，版权等信息
* 实际的软件程序内容

- 使用命令检查rpm包内容:

```bash
rpm -qlp ./path/to/test.rpm
```

如果要详细信息，则再加一个 `-v` 参数:

```bash
rpm -qlpv ./packagecloud-test-1.1-1.x86_64.rpm
```

- 列出安装的RPM包文件，则只需要 `-q` 和 `-l` 参数(比没有安装的rpm包少一个 `-p` 参数)：

```bash
rpm -ql packagecloud-test
```

- 使用rpm2cpio命令可以把软件包转为cpio格式

```bash
rpm2cpio ./packagecloud-test-1.1-1.x86_64.rpm
```

- `rpm2cpio` 命令输出的是 `cpio` 格式包，并且直接输出到标准输出上，所以我们需要使用 `cpio` 命令来通过管道读取这个输出，然后解压并创建文件：

```bash
rpm2cpio ./packagecloud-test-1.1-1.x86_64.rpm | cpio -idmv
```

参数解析：

* `-i` 解压缩
* `-d` 如果需要则创建先导目录
* `-m` 在创建文件时候修改文件的时间戳
* `-v` 是详细信息，在处理过程中会显示出哪些文件处理过了

# 显示RPM包的preinstall和postinstalll脚本

需要注意的是，rpm包中包含了脚本，分别在安装文件前和安装文件后执行，我们需要检查这些脚本

```bash
rpm -qp --scripts ./packagecloud-test-1.1-1.x86_64.rpm
```

如果要检查已经安装的rpm包的脚本，则去掉 `-p` 参数就可以：

```bash
rpm -q --scripts <packagename>
```

# 显示远程仓库中rpm包内容

在 `yum-utils` 工具包中又一个 `repoquery` 可以提供查询远程仓库信息的能力。默认情况下， `repoquery` 会下载 yum repo metadata和update缓存。如果不想更新缓存，而是直接使用缓存信息，则加一个 `-c` 参数或者 `--cache` 参数。要列出软件包的内容，使用 `--list` 参数：

```bash
repoquery --list <packagename>
```


# 参考

* [Inspecting and extracting RPM package contents](https://blog.packagecloud.io/eng/2015/10/13/inspect-extract-contents-rpm-packages/)