# yum安装报错`Package XXX is not signed`

```bash
Package example-package-release13.el5.x86_64.rpm is not signed
```

参考 [yum - Manages packages with the yum package manager](http://docs.ansible.com/ansible/yum_module.html) ，对于没有签名的软件包，需要使用`disable_gpg_check`设置为`yes`来忽略GPG检查安装包的签名。