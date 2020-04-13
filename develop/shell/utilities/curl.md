`curl`是一个极其强大的[命令行传输数据的工具和库](https://curl.haxx.se/)，其作用远超过常用的文件加载功能，可以用于各种网络应用协议交互核测试。

# 从文本获取数据内容

如果要通过curl将文本文件内容发送给网站，使用`@`符号：

> `-d`表示数据

```bash
curl -k https://<SERVER_IP>/API/xyz -H 'Content-Type: application/json' -d @/var/log/example.log
```

> `-k` 表示`--insecure`，不校验服务器SSL安全性

# 提交字段内容null

提交json数据，字段也可以是`null`（例如暂时不知道的字段）:

```bash
curl -k -u user_name:user_password -H "Accept: version=2,application/json" -H "Content-Type: application/json" -X POST -d '{"name": "tom", "phone": null, "address": "x road, y room", "crash_time": "2018-07-26 06:48:02"}' http://myapp.com/api/contact/
```

# 使用代理服务器

在内网或者生产环境，往往会使用代理服务器来实现集中的internet访问以及缓存加速。curl命令也支持代理功能，只需要设置shell环境变量就可以：

```bash
export http_proxy=http://your.proxy.server:port/
export https_proxy=https://your.proxy.server:port/
```

# 参考

* [How to POST file contents using cURL?](https://superuser.com/questions/1054742/how-to-post-file-contents-using-curl)