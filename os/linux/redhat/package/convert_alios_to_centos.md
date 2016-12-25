如果需要转换AliOS到CentOS，可以采用如下方法（假设转换到CentOS 7.3）

```
rpm -e --nodeps alios-release
rpm --import http://mirrors.163.com/centos/7.3.1611/os/x86_64/RPM-GPG-KEY-CentOS-7
rpm -ivh http://mirrors.163.com/centos/7.3.1611/os/x86_64/Packages/centos-release-7-3.1611.el7.centos.x86_64.rpm
echo "Convert AliOS to CentOS finished"
```

> 如果要切换CentOS 版本，例如从 7.2 转换到 7.3.1611

```
rpm -Uvh http://mirrors.163.com/centos/7.3.1611/os/x86_64/Packages/centos-release-7-3.1611.el7.centos.x86_64.rpm
```