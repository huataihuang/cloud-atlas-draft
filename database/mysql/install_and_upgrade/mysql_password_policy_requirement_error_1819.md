当设置MySQL比较简单的密码时候，mysql会返回错误：

```
mysql> SET PASSWORD FOR 'db_user'@'172.17.0.1' = PASSWORD('my_password');
ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
```

如果是测试环境，可以暂时关闭 - 以root用户身份登陆MySQL执行以下命令

```
uninstall plugin validate_password;
```

> **`警告`**：这是一个非常严重的安全隐患，仅在可靠的安全措施下才可以在测试环境使用，务必尽快恢复原有安全设置。

# 参考

* [How do I turn off the mysql password validation?](https://stackoverflow.com/questions/36301100/how-do-i-turn-off-the-mysql-password-validation)