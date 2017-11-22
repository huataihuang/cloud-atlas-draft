CentOS 5非常古老，然而有时候还是需要维护。由于CentOS 5基于RHEL 5，发布于2007年，比`git`作为主流的版本控制软件还要早，所以默认的发行版没有包含`git`工具。

以往需要通过第三方软件仓库安装，例如使用RPMforge软件仓库，但是FPMForge项目已经关闭（参考 [RPMforge](http://wiki.centos.org/AdditionalResources/Repositories/RPMForge) ）。

# 从Fedora项目的EPEL仓库安装（推荐）

Fedora项目的公共下载服务器提供了各个EPEL发行版的软件仓库 http://dl.fedoraproject.org/pub/epel/ ，包含的EPEL 5提供了比CentOS 5更为完整的软件包。也包含了git软件包：

```
sudo rpm -Uvh http://dl.fedoraproject.org/pub/epel/5/i386/epel-release-5-4.noarch.rpm
sudo yum install git-core
```

# 从Webtatic仓库安装（未验证）

第三方的[Webtatic](http://www.webtatic.com/projects/yum-repository/)软件仓库提供了归档软件包，可以通过如下方法安装

```bash
# Add the repository
rpm -Uvh http://repo.webtatic.com/yum/centos/5/latest.rpm

# Install the latest version of git
yum install --enablerepo=webtatic git-all
```

# 源代码编译安装git（未验证，但推荐）

```
yum -y install zlib-devel openssl-devel cpio expat-devel gettext-devel
wget https://github.com/git/git/archive/master.zip
unzip master.zip
cd ./git-master
make configure
./configure
make
sudo make install 
```

# 参考

* [Installing git on CentOS 5 using yum](https://gist.github.com/eddarmitage/2001099)
* [How can git be installed on CENTOS 5.5?](https://stackoverflow.com/questions/3779274/how-can-git-be-installed-on-centos-5-5)