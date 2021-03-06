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

* 使用RESTful HTTP post:

```bash
curl -X POST -d @filename http://hostname/resource
```

* 提交json数据案例:

```bash
curl -XPOST --data '{"data": 123}' api.example.com/data
```

```bash
curl -XPOST --data @data.json api.example.com/data
```

* 登录网站(auth)：将登录信息记录到headers，后续curl都使用headers

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

钉钉支持通过群机器人发送通知信息，但是我没有找到如何用命令参数传递方式发送通知，所以采用的是将文本格式化成json格式存储到文件中，然后通过curl将该文件内容传送给钉钉机器人的URL实现通知。功能是可以正常实现的：

```bash
function ding_alert() {
    robot_url='https://oapi.dingtalk.com/robot/send?access_token=XXXXXXXXXXXXXX'

    ding_data='{"msgtype":"text", "text": {"content": "'
    ding_data=${ding_data}"认证关键字 \n"
    echo $ding_data > ding_data
    cat ding_data_content >> ding_data
    echo '"}}' >> ding_data


    curl $robot_url -H 'Content-Type: application/json' -d @ding_data
}
```

> 文件 `ding_data_content` 是我需要发送给钉钉机器人的消息内容(脚本的其他逻辑会生成这个需要返送消息内容)
> 
> 通过组合json格式，将 `ding_data_content` 转成钉钉的 `ding_data` 
> 
>  这里在文本内容中加入了 `认证关键字` 是为了满足钉钉通知的安全认证，钉钉支持 token和关键字过滤 的安全认证。这里是最简单的方式。
>
> 最后将 `ding_data` 文件发送给钉钉机器人的url

# curl: (1) Protocol "http not supported or disabled in libcurl

需要使用curl来get数据，不过 url 参数是通过访问一个REST接口获得的文件下载链接。这里遇到一个问题，返回的数据是一个json数据，我通过 `jq` 工具可以解析json数据获得URL

```bash
myurl=`curl -q --location --request GET 'http://api.example.com/generatePresignedUrl.json?key=filename' \
--header 'x-apiauth-token: XXXXXX' | jq '.target'`

echo ${myurl}
```

通过 `| jq '.target'` 过滤可以获得文本字符串是带有双引号的 `"url内容"` 

```
"http://download.example.com/filename?Expires=123456&Id=XXXXX&Signature=YYYYY"
```


这是就发现，这届使用 `curl ${myurl}` 会出现报错：

```bash
curl: (1) Protocol "http not supported or disabled in libcurl
```

这是因为传递变量的双引号作为字符串一部分被发送给curl处理，导致出错。也就是说，需要过滤掉字符串的前后双引号字符(增加 `| sed 's/\"//g'` ):

```bash
myurl=`curl -q --location --request GET 'http://api.example.com/generatePresignedUrl.json?key=filename' \
--header 'x-apiauth-token: XXXXXX' | jq '.target' | sed 's/\"//g'`

curl ${myurl}
```

# 安静模式

直接使用 `curl` 命令get，会显示一个进度过程输出。不过对于脚本而言不是很好，所以我们需要使用 `-s` 或者 `--silent` 参数，以静默方式下载。如果不希望任何输出，则重定向到null设备

```
curl -s 'http://example.com' > /dev/null

curl --silent --output /dev/null http://example.com
```

# 参考

* [How to POST file contents using cURL?](https://superuser.com/questions/1054742/how-to-post-file-contents-using-curl)
* [How to send a header using a HTTP request through a curl call?](https://stackoverflow.com/questions/356705/how-to-send-a-header-using-a-http-request-through-a-curl-call)
* [Hide curl output](https://unix.stackexchange.com/questions/196549/hide-curl-output)