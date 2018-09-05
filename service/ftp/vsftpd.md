
* 安装

```
yum install vsftpd
```

* 修改配置文件

```
vi /etc/vsftpd/vsftpd.conf
```

配置：

```
# no anonymous
anonymous_enable=NO
# uncomment (permit ascii mode transfer)
ascii_upload_enable=YES
ascii_download_enable=YES
# 可以不使用chroot 
# uncomment ( enable chroot list ) 
chroot_list_enable=YES
chroot_local_user=YES
# line 99: uncomment ( enable chroot list file )
chroot_list_file=/etc/vsftpd/chroot_list
# line 105: uncomment
ls_recurse_enable=YES

# 不使用chroot就无需设置以下
# add follows to the end
# specify root directory ( if don't specify, users' home directory become FTP home directory )
local_root=public_html
# use localtime
use_localtime=YES
```

* 编辑 `/etc/vsftpd/chroot_list`

```
# add users you allow to move over their home directory
cent
```

* 其他编辑

```
vi /etc/vsftpd/user_list
vi /etc/vsftpd/ftpusers
```

* 设置启动

```
chkconfig vsftpd on
service vsftpd start
```

# 参考

* [FTP Server - Vsftpd](https://www.server-world.info/en/note?os=CentOS_5&p=ftp&f=1)
* [Install vsftp on CentOS 5.5](https://kezhong.wordpress.com/2011/04/13/install-vsftp-on-centos-5-5/)