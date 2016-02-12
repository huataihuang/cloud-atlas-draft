# 远程连接

从Ansible 1.3开始，默认使用原生的OpenSSH来和远程主机通讯。这种方式回激活`ControlPersist`（一种性能提升），`Kerberos`以及在`~/.ssh/config`中配置的`Jump Host`等设置。

> 有关`ControlPersist`，请参考本指南

然而，在RHEL 6操作系统中，由于OpenSSH版本过于陈旧，可能不支持`ControlPersist`。
