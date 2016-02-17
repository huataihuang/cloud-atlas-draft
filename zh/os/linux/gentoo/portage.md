portage是Gentoo最著名的软件管理方法，它提供了高度伸缩行的软件功能管理方法。portage完全使用python和bash编写。

# 检查安装包的USE flag

要查看软件包的USE flag，可以使用`-vp`参数

```bash
emerge -vp openssh
```

可以看到输出信息

```bash
[ebuild   R    ] net-misc/openssh-7.1_p2-r1::gentoo  USE="X hpn pam pie ssl -X509 -bindist -debug -kerberos -ldap -ldns -libedit -libressl -sctp (-selinux) -skey -ssh1 -static" 0 KiB
```

# 参考

* [Handbook:AMD64/Working/Portage](https://wiki.gentoo.org/wiki/Handbook:AMD64/Working/Portage)