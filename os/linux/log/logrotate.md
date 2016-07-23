* 手工执行

```
sudo logrotate -f /etc/logrotate.conf
```

如果出现报错

```
error: line 2 too long in state file /var/lib/logrotate.status
```

则删除掉`/var/lib/logrotate.status`再次执行



# 参考

