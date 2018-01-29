`curl`是一个极其强大的[命令行传输数据的工具和库](https://curl.haxx.se/)，其作用远超过常用的文件加载功能，可以用于各种网络应用协议交互核测试。

# 从文本获取数据内容

如果要通过curl将文本文件内容发送给网站，使用`@`符号：

> `-d`表示数据

```bash
curl -k https://<SERVER_IP>/API/xyz -H 'Content-Type: application/json' -d @/var/log/example.log
```

> `-k` 表示`--insecure`，不校验服务器SSL安全性

# 参考

* [How to POST file contents using cURL?](https://superuser.com/questions/1054742/how-to-post-file-contents-using-curl)