> 如果你和我一样，同时在美亚和中亚注册账号并分别购买正版的电子书籍，就会有一个困扰：我购买了正版的电子书，却无法打通账号，在同一个Kindle设备上阅读。
>
> 作为景德镇居民，即使你非常尊重版权，愿意购买正版的书籍和音像、软件，依然由于ZF的限制，无法自由获取信息。很多人可能需要在美区拥有一个账号，并通过曲径来获取知识和资讯。

Google了相关信息，共享书籍的方法概括如下：

* Amazon的美国账号和中国账号是两套完全隔离的账号系统，无法打通 - 从美国亚马逊的家庭共享方式来看，应该是能够在美亚账号体系内通打通2个成人+4个小孩账号，彼此间购买书籍是共享的。不过，这个方法无法适用于跨区的中亚账号。
* 在iOS/Android Kindle中，如果切换账号，本地设备的前一个账号的书籍会被全部抹掉；但是在Kindle WhitePaper设备上，切换账号会保留上一个账号的书籍，所以如果可以切换账号（虽然切换起来还是很麻烦），还是能够变相满足多个账号书籍共享。
* 通过Calibre这样的电子书工具，可以将PC/Mac上的Kindle书籍转换成epub或mobi格式，这样通过kindle email账号可以传输给指定的kindle用户阅读。这个方法不需要切换kindle设备账号，应该也是最方便的方法。

> 注意：Kindle的所有正版电子书都是有DRM保护的，所以即使你购买了书籍，也无法直接把电子书转给自己的另外一个账号设备阅读。
>
> Calibre默认不能移除DRM，所以要通过第三方的DeDRM插件来去除`azw`文件的DRM

# `请支持正版！本文方法只建议用于自己购买的正版书籍并只用于自己阅读！`

[dedrm-ebook-tools(DRM Removal Tools for eBooks)](https://github.com/psyrendust/dedrm-ebook-tools) 最早是为了保存 [Apprentice Alf's Blog](http://www.apprenticealf.wordpress.com/) 提供（景德镇居民无法访问的WordPress网站）提供的工具，但是目前因为apprenticeharper从2015年开始也建立了GitHub仓库，所以已经不再更新维护。当前可以直接从 [apprenticeharper/DeDRM_tools](https://github.com/apprenticeharper/DeDRM_tools)获取最新的插件工具。

> 请尊重版权，开发者提供开源工具是为了正当的知识和文化传播，并不是支持盗版！

```
curl https://github.com/apprenticeharper/DeDRM_tools/archive/master.zip -o DeDRM_tools.zip
unzip DeDRM_tools.zip
```

解压缩以后，在 `DeDRM_calibre_plugin` 目录下有 calibre 的插件，其中 `DeDRM_plugin.zip` 就是可以直接安装使用的。

> Open calibre's Preferences dialog.  Click on the "Plugins" button.  Next, click on the button, "Load plugin from file".  Navigate to the unzipped DeDRM_tools folder and, in the folder "DeDRM_calibre_plugin", find the file "DeDRM_plugin.zip".  Click to select the file and select "Open".  Click "Yes" in the "Are you sure?" dialog box. Click the "OK" button in the "Success" dialog box.

把Kindle for PC下载的那些azw文件添加到Calibre即可（直接拖进去吧），DeDRM插件会自动去除azw文件的DRM保护并转换成原始格式（azw3或者mobi、prc等）。

> Calibre支持[send to kindle](https://www.amazon.com/gp/sendtokindle)（即[Kindle Personal Documents Service](https://www.amazon.com/gp/help/customer/display.html?nodeId=200767340)，非常方便把各种文档通过电子邮件方式发送给Kindle设备阅读），这样可以将中国区购买的Kindle书籍转换成去除DRM的`.mobi`文档发送到美国区Kindle设备，方便自己的学习。

# 参考

* [用Calibre导入Kindle电子书并去除DRM保护](https://www.librehat.com/importing-kindle-books-with-calibre-and-remove-drm-protection/) - 本文参考，作为支持正版，该文章建议只将移除DRM保护方法用于合法自购的电子书
* [Calibre DRM Removal Plugin, Calibre Remove DRM from EPUB Kindle](http://www.epubsoft.com/calibre-drm-removal-calibre-remove-drm.html) - epubsoft提供了一个移除DRM的Calibre插件，不过我 **没有试用过**
