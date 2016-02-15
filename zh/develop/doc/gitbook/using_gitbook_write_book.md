> 正如你看到的，这本书就是使用gitbook撰写的

# 安装gitbook

* 安装Node.js

> 参考 [在 Windows、Mac OS X 與 Linux 中安裝 Node.js 網頁應用程式開發環境](http://www.gtwang.org/2013/12/install-node-js-in-windows-mac-os-x-linux.html)
>
> 我前期[使用Hexo](再次使用hexo撰写博客)，已经安装了node，使用以下命令验证

    node -v

* 安装Gitbook

使用NMP安装Gitbook

    npm install gitbook -g

> 请使用`nvm`来安装node，这样可以在自己的用户目录下安装和管理各种版本node，就可以避免安装系统目录node，也就不需要使用`sudo`命令。如果使用系统范围的`node.js`，需要使用命令`sudo npm install gitbook -g`

安装完成后，使用以下命令验证是否安装成功

    gitbook -V

这里出现报错

    You need to install "gitbook-cli" to have access to the gitbook command anywhere     on your system.
    If you've installed this package globally, you need to uninstall it.
    >> Run "npm uninstall -g gitbook" then "npm install -g gitbook-cli"

所以重新安装一遍

    npm uninstall -g gitbook
    npm install -g gitbook-cli

# 使用GitBook

* 初始化目录`cloudatlas`

        gitbook init cloudatlas

> 我的个人"云图" [cloudatlas.huatai.me](http://cloudatlas.huatai.me) 记录自己在云计算领域的技术探索。

进入`cloudatlas.huatai.me`目录可以看到该目录下有2个文件，除此之外什么也没有

    README.md
    SUMMARY.md

* 本地预览自动生成

编辑好初步的文档之后（例如编辑 `README.md` ）可以使用`gitbook`命令启用一个本地的服务进行预览

    gitbook serve cloudatlas

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
  * 或者将超链接都集中到文档末尾（假如有多个相同的链接倒是比较方便，不过我没使用这个格式）
  
    [You can use numbers for reference-style link definitions][1]
	
	[1]: http://slashdot.org

# 发布

* 首先在[gitbook](https://www.gitbook.com) 注册一个账号

注册时候会发送一个确认邮件到你的邮箱，如果邮箱地址和你的[gravatar注册头像](http://en.gravatar.com/)一致，就会自动显示在gitbook上（也可以在设置中修改）。

* 在gitbook的设置`Profile`中，其中有一项是`Connect GitHub Account`。使用这个管理功能，github会通过oauth方式，给予gitbook访问 **公开的仓库** 权限（这步需要么？）

* 创建图书，在图书页面选择 `github` ，此时选择gitbub的某个公开的仓库（也就是你前面将自己的gitbook推送的仓库），通过关联后，这个仓库的书就会出现在在 https://{author}.gitbooks.io/{book}/

> 例如，我的有关云计算的书 Cloud Atlas https://huataihuang.gitbooks.io/cloudatlas/

# 插件

[gitbook插件](https://plugins.gitbook.com/)可以给你的电子书带来更多的功能，请尝试吧！

# 参考

* [GitBook使用指南](http://wanqingwong.com/gitbook-zh/)
* [GitBook Help](https://www.gitbook.com/book/gitbookio/documentation/details)
* [使用Gitbook制作电子书](http://www.ituring.com.cn/article/127645)
* [使用GitBook平台发布电子书](http://www.ituring.com.cn/article/127744)
* [GitBook, Git + Markdown 快速发布你的书籍](http://leeluolee.github.io/2014/07/22/2014-07-22-gitbook-guide/)