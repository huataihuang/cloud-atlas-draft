> 正如你看到的，这本书就是使用gitbook撰写的

# 安装gitbook

* 安装Node.js

> 参考 [在 Windows、Mac OS X 與 Linux 中安裝 Node.js 網頁應用程式開發環境](http://www.gtwang.org/2013/12/install-node-js-in-windows-mac-os-x-linux.html)
>
> 我前期[使用Hexo](再次使用hexo撰写博客)，已经安装了node，使用以下命令验证

    node -v

* 安装Gitbook

使用NMP安装Gitbook

    npm install gitbook-cli -g

> 请使用`nvm`来安装node，这样可以在自己的用户目录下安装和管理各种版本node，就可以避免安装系统目录node，也就不需要使用`sudo`命令。如果使用系统范围的`node.js`，需要使用命令`sudo npm install gitbook -g`

安装完成后，使用以下命令验证是否安装成功

    gitbook -V

# 使用GitBook

* 初始化目录`cloud-atlas`

        gitbook init cloud-atlas

> 我的个人"云图" [cloud-atlas.huatai.me](http://cloud-atlas.huatai.me) 记录自己在云计算领域的技术探索。

进入`cloud-atlas.huatai.me`目录可以看到该目录下有2个文件，除此之外什么也没有

    README.md
    SUMMARY.md

* 本地预览自动生成

编辑好初步的文档之后（例如编辑 `README.md` ）可以使用`gitbook`命令启用一个本地的服务进行预览

    gitbook serve cloud-atlas

此时会在 `cloudatlas` 目录下生成一个子目录`_book`包含了所有生成的静态网站文件。

* 使用`build`参数将静态文件生成到指定目录

也可以将静态文件生成到指定目录下，这样就可以方便打包输出的静态文件

    mkdir /tmp/gitbook
    gitbook build cloudatlas.huatai.me --output=/tmp/gitbook

通过浏览器访问 http://localhost:4000 来查看页面效果

# 输出pdf

要输出PDF文件，先安装`gitbook-pdf`

    npm install gitbook-pdf -g

这里安装报错显示

    Downloading http://cdn.bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-macosx.zip
    Saving to /usr/local/lib/node_modules/gitbook-pdf/node_modules/phantomjs/phantomjs/phantomjs-1.9.7-macosx.zip
    Receiving...
    Error requesting archive.
    Status: 403
    ...
    npm ERR! phantomjs@1.9.7-5 install: `node install.js`
    npm ERR! Exit status 1

参考[Yeoman generator always get some error](http://stackoverflow.com/questions/23823319/yeoman-generator-always-get-some-error)，尝试

    PHANTOMJS_CDNURL=https://bitbucket.org/ariya/phantomjs/downloads npm install phantomjs

虽然正确安装了 `phantomjs-1.9.8`，但是安装`gitbook-pdf`同样失败。后来发现，应该是这个安装 `gitbook-pdf` 依赖安装指定版本，所以参考 [npm-install](https://docs.npmjs.com/cli/install)安装指定版本

    PHANTOMJS_CDNURL=https://bitbucket.org/ariya/phantomjs/downloads npm install phantomjs@1.9.7-5

> 还没有成功

# GitBook简明使用手册

## 首页

> 详细的Gitbook使用参考 [GitBook使用指南](GitBook使用指南)

默认文件`README.md`，这个文件是介绍网站的的说明，也是GitBook显示在首页的内容

> 在Gitbook的2.0.0之后，可以在  book.json 中指定文件作为README

    {
        "structure": {
        "readme": "myIntro.md"
        }
    }

## 章节

GitBook使用 `SUMMARY.md`来定义章节和子章节

    # Summary

    * [Chapter 1](chapter1.md) 
    * [Chapter 2](chapter2.md)
    * [Chapter 3](chapter3.md)

子章节案例：

    # Summary
    
    * [Part I](part1/README.md)
        * [Writing is nice](part1/writing.md)
        * [GitBook is nice](part1/gitbook.md)
    * [Part II](part2/README.md)
        * [We love feedback](part2/feedback_please.md)
        * [Better tools for authors](part2/better_tools.md)# Summary
    * [Part I](part1/README.md)
        * [Writing is nice](part1/writing.md)
        * [GitBook is nice](part1/gitbook.md)
    * [Part II](part2/README.md)
        * [We love feedback](part2/feedback_please.md)
        * [Better tools for authors](part2/better_tools.md)

## MarkDown

[GitBook使用GitHub favorited markdown格式](http://help.gitbook.com/format/markdown.html)

* 链接
  * 可以直接引用URL `[Google官网](https://www.google.com)`
  * 也可以引用本网站的文档，如 `[内核进程状态参考](../../../../os/linux/kernel/process_stat_indicates.md)`
  * 可以直接引用相同目录下的文档，如 `[ssh portfording设置](ssh_portfording.md)`：不过需要注意，所引用的文档必须在`summary.md`中已经定义，这样才能够创建html文件，并正确引用
  * 或者将超链接都集中到文档末尾（假如有多个相同的链接倒是比较方便，不过我没使用这个格式）
  
    [You can use numbers for reference-style link definitions][1]
	
	[1]: http://slashdot.org

# 发布

* 首先在[gitbook](https://www.gitbook.com) 注册一个账号

注册时候会发送一个确认邮件到你的邮箱，如果邮箱地址和你的[gravatar注册头像](http://en.gravatar.com/)一致，就会自动显示在gitbook上（也可以在设置中修改）。

* 在gitbook的设置`Profile`中，其中有一项是`Connect GitHub Account`。使用这个管理功能，github会通过oauth方式，给予gitbook访问 **公开的仓库** 权限（这步需要么？）

* 创建图书，在图书页面选择 `github` ，此时选择gitbub的某个公开的仓库（也就是你前面将自己的gitbook推送的仓库），通过关联后，这个仓库的书就会出现在在 https://{author}.gitbooks.io/{book}/

> 例如，我的有关云计算的书 Cloud Atlas https://huataihuang.gitbooks.io/cloud-atlas/

# 插件

[gitbook插件](https://plugins.gitbook.com/)可以给你的电子书带来更多的功能，请尝试吧！

* [PlantUML in GitBook](https://plugins.gitbook.com/plugin/puml)

[GitBook + PlantUML 以 Markdown 快速製作 UML 教材](http://blog.lyhdev.com/2014/12/gitbook-plantuml-markdown-uml.html)

# 升级

升级到GitBook 3.x 时候，在执行 `gitbook serve` 命令的终端提示

```
Live reload server started on port: 35729
Press CTRL+C to quit ...

info: 8 plugins are installed
info: loading plugin "disqus"... OK
info: loading plugin "livereload"... OK
info: loading plugin "highlight"... OK
info: loading plugin "search"... OK
info: loading plugin "lunr"... OK
info: loading plugin "sharing"... OK
info: loading plugin "fontsettings"... OK
info: loading plugin "theme-default"... OK
info: found 348 pages
info: found 111 asset files
warn: "sections" property is deprecated, use page.content instead
```

检查了 `node_modules` 目录下模块，发现是 `gitbook-plugin-codeblock-filename` 使用了 `page.sections` ，但是观察了最新的gitbook，发现已经支持章节缩进，所以就去除掉多个插件，只保留`disqus`插件。

发现访问 http://127.0.0.1:35729 不能正常展示，页面只提示

```
{"tinylr":"Welcome","version":"0.2.1"}
```

但是依然出现同样无法展示问题。参考 [Gitbookのインストール（2016/1/19時点）](http://swiftlife.hatenablog.jp/entry/2016/01/19/205357) ，原来这个页面`{"tinylr":"Welcome","version":"0.2.1"}`是表示安装gitbook成功。

但是，发现过了很久，大约 380 秒以后才提示出现

```
info: >> generation finished with success in 380.2s !

Starting server ...
Serving book on http://localhost:4000
```

原来升级到新版本之后，在重新绘制页面出现了非常缓慢的问题。在 [Generating slowly when the file number is large #1497](https://github.com/GitbookIO/gitbook/issues/1497) 提出了同样的问题，显示升级到 3.x 之后build非常缓慢。我自己测试了一下，差不多一个文件需要1秒钟，期间单个CPU负载满负荷运行。

[Setup and Installation of GitBook](https://github.com/GitbookIO/gitbook/blob/master/docs/setup.md) 提供了如下debug的方法

```
gitbook build ./ --log=debug --debug
```

此外可以统计各阶段的使用时间

```
gitbook build --timing
```

显示输出大部分时间消耗在`template.render`

```
debug: 0.0% of time spent in "call.hook.finish:before" (1 times) :
debug:     > Total: 1ms | Average: 1ms
debug:     > Min: 1ms | Max: 1ms
debug: ---------------------------
debug: 0.0% of time spent in "call.hook.init" (1 times) :
debug:     > Total: 1ms | Average: 1ms
debug:     > Min: 1ms | Max: 1ms
debug: ---------------------------
debug: 0.0% of time spent in "call.hook.config" (1 times) :
debug:     > Total: 2ms | Average: 2ms
debug:     > Min: 2ms | Max: 2ms
debug: ---------------------------
debug: 0.0% of time spent in "plugins.findForBook" (1 times) :
debug:     > Total: 52ms | Average: 52ms
debug:     > Min: 52ms | Max: 52ms
debug: ---------------------------
debug: 0.0% of time spent in "parse.listAssets" (1 times) :
debug:     > Total: 98ms | Average: 98ms
debug:     > Min: 98ms | Max: 98ms
debug: ---------------------------
debug: 0.1% of time spent in "call.hook.page:before" (348 times) :
debug:     > Total: 187ms | Average: 1ms
debug:     > Min: 0ms | Max: 5ms
debug: ---------------------------
debug: 0.1% of time spent in "plugin.load" (8 times) :
debug:     > Total: 194ms | Average: 24ms
debug:     > Min: 1ms | Max: 147ms
debug: ---------------------------
debug: 0.1% of time spent in "call.hook.finish" (1 times) :
debug:     > Total: 259ms | Average: 259ms
debug:     > Min: 259ms | Max: 259ms
debug: ---------------------------
debug: 0.1% of time spent in "parse.book" (1 times) :
debug:     > Total: 270ms | Average: 270ms
debug:     > Min: 270ms | Max: 270ms
debug: ---------------------------
debug: 0.1% of time spent in "parse.listPages" (1 times) :
debug:     > Total: 300ms | Average: 300ms
debug:     > Min: 300ms | Max: 300ms
debug: ---------------------------
debug: 0.4% of time spent in "call.hook.page" (348 times) :
debug:     > Total: 1.36s | Average: 4ms
debug:     > Min: 0ms | Max: 110ms
debug: ---------------------------
debug: 2.2% of time spent in "page.generate" (348 times) :
debug:     > Total: 8.31s | Average: 24ms
debug:     > Min: 11ms | Max: 136ms
debug: ---------------------------
debug: 92.3% of time spent in "template.render" (696 times) :
debug:     > Total: 344.00s | Average: 494ms
debug:     > Min: 0ms | Max: 1.33s
debug: ---------------------------
debug: 17.46s spent in non-mesured sections
```

# 回滚gitbook版本

> 参考 [How do I install a previous version of an npm package?](http://stackoverflow.com/questions/15890958/how-do-i-install-a-previous-version-of-an-npm-package)

```
npm view gitbook versions
```

```
npm remove gitbook@3.2.2
npm install gitbook@2.6.7
```

# 参考

* [GitBook使用指南](http://wanqingwong.com/gitbook-zh/)
* [GitBook Help](https://www.gitbook.com/book/gitbookio/documentation/details)
* [使用Gitbook制作电子书](http://www.ituring.com.cn/article/127645)
* [使用GitBook平台发布电子书](http://www.ituring.com.cn/article/127744)
* [GitBook, Git + Markdown 快速发布你的书籍](http://leeluolee.github.io/2014/07/22/2014-07-22-gitbook-guide/)