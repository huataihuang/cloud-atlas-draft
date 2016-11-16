在CentOS 7中引入了新的防火墙管理工具`firewalld`，新的操作方法：

* 检查激活的zone

```
firewall-cmd --get-active-zones
```

* 例如在dmz区域设置端口允许端口2888

```
firewall-cmd --zone=dmz --add-port=2888/tcp --permanent
```

如果是常用的web端口，可以使用

```
firewall-cmd --zone=public --add-service=http --permanent
```

* 例如在public区域设置允许端口2888

```
firewall-cmd --zone=public --add-port=2888/tcp --permanent
```

**注意** 要使得配置生效需要重新加载配置

```
firewall-cmd --reload
```

> 如果没有使用`firewalld`还是使用iptables的话，命令如下

```
sudo iptables -I INPUT -p tcp --dport 2888 -j ACCEPT
sudo service iptables save
```

# 参考

* [centos 7 - open firewall port](http://stackoverflow.com/questions/24729024/centos-7-open-firewall-port)

