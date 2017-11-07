Django默认提供了一个主机访问安全限制，

```
DisallowedHost at /
Invalid HTTP_HOST header: '192.168.1.101:8000'. You may need to add u'30.17.44.12' to ALLOWED_HOSTS.
```

如果服务部署到不同的主机上，要分别去配置不同主机上的`settings.py`中的`ALLOWED_HOSTS`是非常麻烦的（当然也可以通过puppet这样的配置管理工具完成）。

解决方法是：

* 使用统配符`*`

```
ALLOWED_HOSTS = ['*']
```

> 这个方法放宽了安全限制，所以也可以采用 [Allow ALLOWED_HOSTS to accept an IP-range / wildcard](https://code.djangoproject.com/ticket/27485) 提供的方法。

# 参考

* [CommandError: You must set settings.ALLOWED_HOSTS if DEBUG is False](https://stackoverflow.com/questions/24857158/commanderror-you-must-set-settings-allowed-hosts-if-debug-is-false)