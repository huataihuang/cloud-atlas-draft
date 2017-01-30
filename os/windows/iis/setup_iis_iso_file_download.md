刚通过Wizard安装好IIS并启用web下载文件，但是发现不能下载`.iso`文件，页面提示需要设置`MIME`，在终端使用`wget`下载文件也遇到

```
HTTP request sent, awaiting response... 404 Not Found
```

参考[Add a MIME Type (IIS 7)](https://technet.microsoft.com/en-us/library/cc725608(v=ws.10).aspx)


* 在网站的功能列表中选择`MIME 类型`

![iis mime设置](../../../img/os/windows/iis/iis_mime.png)

* 在`MIME 类型`设置中点击`添加`：文件扩展名`.iso`并且设置MIME类型`application/octet-stream`

![iis mime设置](../../../img/os/windows/iis/iis_setup_mime.png)

* 或执行以下命令（暂时没有试出，似乎`appcmd`命令没有安装）

```
appcmd set config /section:staticContent /+"[fileExtension=' .xyz ',mimeType=' application/octet-stream ']"
```