通常RedHat/CentOS服务器都采用最小化安装操作系统，然后做基本定制安装。

# CentOS 7

```bash
yum -y install which sudo nmap-ncat mlocate net-tools rsyslog file ntp ntpdate \
wget tar bzip2 screen sysstat unzip nfs-utils parted lsof man bind-utils \
gcc gcc-c++ make telnet flex autoconf automake ncurses-devel crontabs \
zlib-devel git
```