古老而稳定并且已经End of Life的CentOS 5系列，操作系统的默认是[Python版本2.4.3，对于Django"不友好"需要安装Python 2.7](../django/startup/quick_install_django)，但是即使是EPEL也只提供Python 2.6版本。[RPM Fusion](https://rpmfusion.org/Configuration) 也只提供CentOS 6以上的发行版支持。

> **`警告`**
>
> 通过源代码编译安装Python 2.7的时候，务必使用`make altinstall`来进行安装，否则会导致和系统默认的Python版本冲突导致很多系统异常！！！

> [The Software Collections ( SCL ) Repository](https://wiki.centos.org/AdditionalResources/Repositories/SCL)为CentOS 6/7 提供了操作系统底层特别软件包，是安装一些基础软件非常好的软件仓库。不过，对于CentOS 5依然无解。

```
yum install centos-release-scl
```

> 从[Atomic项目](http://www.projectatomic.io)的虚拟容器看，容器操作系统做了定制，似乎google搜索到有针对Python2.7的rpm发布，可尝试。

# 源代码编译安装Python 2.7

* 准备工作

```bash
# Start by making sure your system is up-to-date:
yum update
# Compilers and related tools: 这步可选，见注释
yum groupinstall -y "development tools"
# Libraries needed during compilation to enable all features of Python:
yum install -y zlib-devel bzip2-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gdbm-devel db4-devel libpcap-devel xz-devel expat-devel
# If you are on a clean "minimal" install of CentOS you also need the wget tool:
yum install -y wget
```

> 参考 [Docker环境安装CentOS](../../../virtual/docker/using_docker/docker_run_centos_container) 安装基础软件包即包含了必要的开发工具，可以取代`yum groupinstall -y "development tools"`

```bash
yum -y install which mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git openssh-clients openssh-server initscripts
```

* 编译安装Python

```bash
# Python 2.7.14:
wget http://python.org/ftp/python/2.7.14/Python-2.7.14.tar.xz
tar xf Python-2.7.14.tar.xz
cd Python-2.7.14
./configure --prefix=/usr/local --enable-unicode=ucs4 --enable-shared LDFLAGS="-Wl,-rpath /usr/local/lib"
make && make altinstall

# Python 3.6.3:
wget http://python.org/ftp/python/3.6.3/Python-3.6.3.tar.xz
tar xf Python-3.6.3.tar.xz
cd Python-3.6.3
./configure --prefix=/usr/local --enable-shared LDFLAGS="-Wl,-rpath /usr/local/lib"
make && make altinstall
```

> CentOS 5自带的tar版本是1.15.1，还不支持`.xz`文件的解压缩参数`-J`，所以需要单独安装`xz`工具解压缩`.xz`文件之后，再使用`tar xf`命令解包。

> `a release build with all optimizations active (LTO, PGO, etc)`的含义：
>
> 在`./configure`时候，有一个提示`If you want a release build with all optimizations active (LTO, PGO, etc), please run ./configure --enable-optimizations.`。参考[what does --enable-optimizations do while compiling python?](https://stackoverflow.com/questions/41405728/what-does-enable-optimizations-do-while-compiling-python)
>
> Profile guided optimization (PGO) 和 Link Time Optimization (LTO)是GCC实现的编译优化，虽然在编译程序时速度较慢，但是可以明显提升程序启动速度（可能有10~20%）。

上述安装完成后，就可以通过`python2.7`来使用最新的`2.7.14`版本Python。

* 安装升级pip

```bash
# First get the script:
wget https://bootstrap.pypa.io/get-pip.py

# Then execute it using Python 2.7 and/or Python 3.6:
python2.7 get-pip.py
python3.6 get-pip.py

# With pip installed you can now do things like this:
pip2.7 install [packagename]
pip2.7 install --upgrade [packagename]
pip2.7 uninstall [packagename]
```

* 安装虚拟环境`virtualenv`

```bash
# Install virtualenv for Python 2.7 and create a sandbox called "venv2"
pip2.7 install virtualenv
virtualenv venv2

# Activate the venv2 sandbox:
source venv2/bin/activate
# Check the Python version in the sandbox (it should be Python 2.7.14):
python --version
# Deactivate the sandbox:
deactivate
```

这里在CentOS 5上执行`pip2.7 install virtualenv`出现报错

```
/usr/local/bin/pip2.7: line 4: import: command not found
/usr/local/bin/pip2.7: line 5: import: command not found
/usr/local/bin/pip2.7: line 7: from: command not found
/usr/local/bin/pip2.7: line 10: syntax error near unexpected token `('
/usr/local/bin/pip2.7: line 10: `    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])'
```

这个问题参考[./xx.py: line 1: import: command not found](https://stackoverflow.com/questions/22275350/xx-py-line-1-import-command-not-found)，检查`/usr/local/bin/pip2.7`发现这个Python程序最开始的行显示

```
#!
```

似乎是安装工具的时候出现问题，修改成`#!/usr/local/bin/python2.7`就可以正常工作了。

# 参考

* [How to install the latest version of Python on CentOS](https://danieleriksson.net/2017/02/08/how-to-install-latest-python-on-centos/)
* [How to install Python 2.7 on RHEL 5](http://blog.technotesdesk.com/how-to-install-python-2-7-on-rhel-5)
* [A system administrators guide to installing and maintaining multiple python environments](http://russell.ballestrini.net/a-system-administrators-guide-to-installing-and-maintaining-multiple-python-environments/)