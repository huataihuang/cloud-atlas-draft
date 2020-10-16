`curl`是一个极其强大的[命令行传输数据的工具和库](https://curl.haxx.se/)，其作用远超过常用的文件加载功能，可以用于各种网络应用协议交互核测试。

# 从文本获取数据内容

如果要通过curl将文本文件内容发送给网站( ``post`` )，使用`@`符号：

> `-d`表示数据，也可以是 ``--data`` 。注意，文件名前面一定要加上 `@` 符号。

```bash
curl -k https://<SERVER_IP>/API/xyz -H 'Content-Type: application/json' -d @/var/log/example.log
```

> `-k` 表示`--insecure`，不校验服务器SSL安全性 ，请参考 [How to ignore invalid and self signed ssl connection errors with curl](https://www.cyberciti.biz/faq/how-to-curl-ignore-ssl-certificate-warnings-command-option/) 。特别适合很多内网部署服务，自己签发的非正式证书。

如果是使用curl上传文件，则使用:

```bash
curl --from "fileupload=@filename.txt" http://hostname/resource
```

使用RESTful HTTP post:

```bash
curl -X POST -d @filename http://hostname/resource
```

登录网站(auth)：将登录信息记录到headers，后续curl都使用headers

```bash
curl -d "username=admin&password=admin&submit=Login" --dump-header headers http://localhost/Login
curl -L -b headers http://localhost/
```

# 通过curl检查https证书

```bash
curl -v https://www.baidu.com
```

如果服务器是自签名证书，则加上 `-k` 参数。如果想要禁止证书警告，例如你的自签名证书服务器，你需要下载文件，忽略证书告警，在使用参数 `-I` :

```bash
curl -k -O https://202.54.1.2/file.tar.gz
```

另外，如果你仅仅想截取证书信息，则参考 

# 提交字段内容null

提交json数据，字段也可以是`null`（例如暂时不知道的字段）:

```bash
curl -k -u user_name:user_password -H "Accept: version=2,application/json" -H "Content-Type: application/json" -X POST -d '{"name": "tom", "phone": null, "address": "x road, y room", "crash_time": "2018-07-26 06:48:02"}' http://myapp.com/api/contact/
```

# 指定CA信任通过curl访问

可以指定自签名证书

```bash
curl --cacert /pth/to/my/ca.pem https://url
curl --header 'Host: www.cyberciti.biz' --cacert /pth/to/my/ca.pem https://207.5.1.10/nixcraft.tar.gz
```

# 脚本方式截取https证书信息

参考 [how to use curl to verify if a site's certificate has been revoked?](https://superuser.com/questions/742393/how-to-use-curl-to-verify-if-a-sites-certificate-has-been-revoked)

使用以下命令获取服务器证书信息（例如检查服务器证书到期时间）:

```bash
curl --insecure -v https://www.baidu.com 2>&1 | awk 'BEGIN { cert=0 } /^\* Server certificate:/ { cert=1 } /^\*/ { if (cert) print }'
```

输出可以看到：

```
* Server certificate:
*  subject: C=CN; ST=beijing; L=beijing; OU=service operation department; O=Beijing Baidu Netcom Science Technology Co., Ltd; CN=baidu.com
*  start date: May  9 01:22:02 2019 GMT
*  expire date: Jun 25 05:31:02 2020 GMT
*  issuer: C=BE; O=GlobalSign nv-sa; CN=GlobalSign Organization Validation CA - SHA256 - G2
*  SSL certificate verify ok.
* Connection #0 to host www.baidu.com left intact
* Closing connection 0
```

# 使用代理服务器

在内网或者生产环境，往往会使用代理服务器来实现集中的internet访问以及缓存加速。curl命令也支持代理功能，只需要设置shell环境变量就可以：

```bash
export http_proxy=http://your.proxy.server:port/
export https_proxy=https://your.proxy.server:port/
```

# 通过钉钉机器人发信息



# 参考

* [How to POST file contents using cURL?](https://superuser.com/questions/1054742/how-to-post-file-contents-using-curl)
* [How to send a header using a HTTP request through a curl call?](https://stackoverflow.com/questions/356705/how-to-send-a-header-using-a-http-request-through-a-curl-call)
