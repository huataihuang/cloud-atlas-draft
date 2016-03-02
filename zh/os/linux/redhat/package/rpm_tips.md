# rpm检查spec

遇到一个问题，需要检查rpm包的原始spec文件，搜索了一下，可能有如下解决方法

* 使用`rpmrebuild`工具 - 参考[extract the spec file from rpm package](http://stackoverflow.com/questions/5613954/extract-the-spec-file-from-rpm-package)

    rpmrebuild --package --notest-install -e oracle-instantclient-basic-10.2.0.4-1.x86_64.rpm
    rpmrebuild -s hercules.spec hercules

> 可以从现有下载的rpm中或者已经安装的软件获取原始的spec文件

# rpm检查依赖包

如果要检查软件包依赖，可以使用

    rpm -q --requires xmms

参考 [How to extract spec file from rpm file](http://www.linuxquestions.org/questions/programming-9/how-to-extract-spec-file-from-rpm-file-426847/)

# rpm检查所有安装的文件列表

列出所有安装文件

    rpm -ql BitTorrent

# rpm检查最近安装的包

显示最近安装的包

    rpm -qa --last

显示所有安装包

    rpm -qa

# 检查一个文件属于哪个rpm包

例如检查passwd文件属于哪个包

    rpm -qf /usr/bin/htpasswd

# 检查rpm包依赖

    rpm -qR <package-name>

# 检查rpm包的信息

    rpm -qi vsftpd

> 可以输出rpm包的详细信息

# 在安装rpm之前检查包信息

    rpm -qip sqlbuddy-1.3.3-1.noarch.rpm

# 检查已经安装的软件包的文档

    rpm -qdf /usr/bin/vmstat

# 校验rpm包

    rpm -Vp sqlbuddy-1.3.3-1.noarch.rpm

# 校验所有安装软件包

    rpm -Va

# 导入rpm的GPG key


    rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-6


# 重建损坏的RPM包

    cd /var/lib
    rm __db*
    rpm --rebuilddb
    rpmdb_verify Packages

# rpm版本降低

对于已经安装了高版本的软件包，需要降级版本，则需要使用参数`--oldpackage`，这样就允许安装旧版本。另外要注意使用`-U`参数，这样就是`upgrade`，就会替换另一个版本。如果使用`-i`参数替代`-U`，则会导致同时安装两个版本。

    rpm -Uvh --oldpackage [filename]

> 参考[How do I downgrade an RPM?](http://serverfault.com/questions/274310/how-do-i-downgrade-an-rpm)

也可以使用 `yum downgrade packagename` 方法。