> 正如你看到的，这本书就是使用gitbook撰写的

# 安装gitbook

* 安装Node.js

> 参考 [在 Windows、Mac OS X 與 Linux 中安裝 Node.js 網頁應用程式開發環境](http://www.gtwang.org/2013/12/install-node-js-in-windows-mac-os-x-linux.html)
>
> 我前期[使用Hexo撰写boke](../write_blog_by_hexo)，已经安装了node，使用以下命令验证

    node -v

> 如果没有安装，可以使用`nvm`来[管理node.js版本](../write_blog_by_hexo)

* 安装Gitbook

使用NMP安装Gitbook

    npm install gitbook-cli -g

> 请使用`nvm`来安装node，这样可以在自己的用户目录下安装和管理各种版本node，就可以避免安装系统目录node，也就不需要使用`sudo`命令。如果使用系统范围的`node.js`，需要使用命令`sudo npm install gitbook -g`

安装完成后，使用以下命令验证是否安装成功

    gitbook -V

> 上述这个命令会安装稳定版本，如果要指定安装版本，例如安装alpha版本，则先检查可安装版本

```
gitbook ls-remote
```

然后安装pre版本

```
gitbook fetch pre
```

此时会看到gitbook被安装到`$HOME/.gitbook/versions/4.0.0-alpha.4`。并且，为了能够默认使用这个版本，还需要做一个软链接

```
cd $HOME/.gitbook/versions/
ln -s 4.0.0-alpha.4 latest
```

此时再验证版本就会看到

```
gitbook -V
```

显示输出使用了`alpha`版本，而不会去安装stable版本

```
CLI version: 2.3.0
GitBook version: latest (4.0.0-alpha.4)
```

## 升级Gitbook

检查已经安装的版本

```
gitbook ls
```

查看远程版本

```
gitbook ls-remote
```

以上显示gitbook可安装版本，并且有Tag为latest稳定版本和pre的测试版本。

安装特定版本，例如安装alpha版本

```
gitbook fetch 4.0.0-alpha.4
```

安装预发布版本(根据`gitbook ls-remote`提示的版本标签)

```
gitbook fetch pre
```

升级最新稳定版本

```
gitbook update
```

如果要使用pre版本，则要使用

```
gitbook update pre
```

卸载稳定版本，准备改用pre版本

```
gitbook uninstall 3.2.2
```

设置某个本地目录作为最新版本

```
gitbook alias /opt/mygitbook latest
```

> 上述命令实际上是在 `$HOME/.gitbook/versions` 目录下的多个gitbook版本，创建了一个软链接

```
latest -> /opt/mygitbook
```

如果要使用特定版本来build文档，可以使用

```
gitbook build ./mybook --gitbook=4.0.0-alpha.4
```

参考 [Configuration](https://github.com/GitbookIO/gitbook/blob/master/docs/config.md) 可以通过设置gitbook文档目录下的`book.json`文件配置来调整GitBook编译所使用的软件版本。例如，想使用最新的`4.0.0-alpha.4`，可以使用如下配置

```
{
  "gitbook": "4.0.0-alpha.4",
  ...
}
```

这样使用命令`gitbook build`时候就不需要再增加`--gitbook=4.0.0-alpha.4`作为参数，简化命令。

不过，为了能够更加通用，实际我是在 `$HOME/.gitbook/versions` 执行以下命令，将`4.0.0-alpha.4`软链接成`latest`，这样后续所有执行`gitbook`就不需要再强制版本了（也不会再去下载latest版本）

```
cd $HOME/.gitbook/versions
unlink latest
ln -s 4.0.0-alpha.4 latest
```

此时再使用`gitbook -V`验证可以看到如下输出显示已经升级到最新的alpha版本

```
CLI version: 2.3.0
GitBook version: latest (4.0.0-alpha.4)
```

* 将gitbook 3.2.2升级到4.0.0-beta版本后，还要注意，如果同时升级过node.js版本，需要在node.js中使用npm安装升级对应插件：

```
npm install gitbook-plugin-codeblock-filename -g

npm install react react-dom react-disqus-thread gitbook-plugin-disqus -g
```

> `react react-dom react-disqus-thread gitbook-plugin-disqus`这些npm包需要一起依赖安装，上述命令会全局安装到`nvm`目录下。

不过，最好还是在文档目录下编辑好`book.json`文件

```
{
  "gitbook": "4.0.0-alpha.4",
  "plugins": ["disqus","toggle-chapters"],
  "pluginsConfig": {
    "disqus": {
      "shortName": "XXXXXX"
    }
  }
}
```

然后执行以下命令先删除掉旧版本插件，然后重新安装插件

```
rm -rf node_modules/*
gitbook install
```

## 升级到`4.0.0-alpha.4`之后的处理

* 在文档目录执行`gitbook serve`时候出现如下报错

```
Error: ENOENT: no such file or directory, open '/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/_assets/plugin.js'
```

解决方法参考常规的插件安装

```
cd /Users/huatai/.gitbook/versions/4.0.0-alpha.4
npm i gitbook-plugin-livereload
```

> 提示`gitbook-plugin-livereload`是在`/Users/huatai/.gitbook/versions/4.0.0-alpha.4`目录（包含了`packages.json`配置文件），所以在这个执行`npm i gitbook-plugin-livereload`就会安装模块到该目录下的`node_modules`子目录中。这是npm的常规安装方法，并且这个本地安装方法会读取`package.json`文件来安装对应模块版本。 - 参考 [Installing npm packages locally](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)

但是，我发现上述本地安装`gitbook-plugin-livereload`模块实际上只在`node_modules/gitbook-plugin-livereload`更新了编译安装配置文件，实际上操作方法应该是进入`node_modules/gitbook-plugin-livereload`后执行`npm install`命令，所以再次修复

```
cd /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload
npm install
```

> 上述过程存在编译错误

```
> spawn-sync@1.0.15 postinstall /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/spawn-sync
> node postinstall


> gitbook-plugin-livereload@4.0.0-alpha.4 prepublish /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload
> npm run build-js


> gitbook-plugin-livereload@4.0.0-alpha.4 build-js /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload
> gitbook-plugin build ./src/index.js ./_assets/plugin.js

events.js:160
      throw er; // Unhandled 'error' event
      ^

Error: Couldn't find preset "es2015" relative to directory "/Users/huatai/.gitbook/versions/4.0.0-alpha.4" while parsing file: /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/src/index.js
    at /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/file/options/option-manager.js:292:19
    at Array.map (native)
    at OptionManager.resolvePresets (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/file/options/option-manager.js:274:20)
    at OptionManager.mergePresets (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/file/options/option-manager.js:263:10)
    at OptionManager.mergeOptions (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/file/options/option-manager.js:248:14)
    at OptionManager.init (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/file/options/option-manager.js:367:12)
    at File.initOptions (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/file/index.js:216:65)
    at new File (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/file/index.js:139:24)
    at Pipeline.transform (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babel-core/lib/transformation/pipeline.js:46:16)
    at Babelify._flush (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/node_modules/babelify/index.js:27:24)

npm ERR! Darwin 16.4.0
npm ERR! argv "/Users/huatai/.nvm/versions/node/v6.9.4/bin/node" "/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/.bin/npm" "run" "build-js"
npm ERR! node v6.9.4
npm ERR! npm  v3.10.9
npm ERR! code ELIFECYCLE
npm ERR! gitbook-plugin-livereload@4.0.0-alpha.4 build-js: `gitbook-plugin build ./src/index.js ./_assets/plugin.js`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the gitbook-plugin-livereload@4.0.0-alpha.4 build-js script 'gitbook-plugin build ./src/index.js ./_assets/plugin.js'.
npm ERR! Make sure you have the latest version of node.js and npm installed.
npm ERR! If you do, this is most likely a problem with the gitbook-plugin-livereload package,
npm ERR! not with npm itself.
npm ERR! Tell the author that this fails on your system:
npm ERR!     gitbook-plugin build ./src/index.js ./_assets/plugin.js
npm ERR! You can get information on how to open an issue for this project with:
npm ERR!     npm bugs gitbook-plugin-livereload
npm ERR! Or if that isn't available, you can get their info via:
npm ERR!     npm owner ls gitbook-plugin-livereload
npm ERR! There is likely additional logging output above.

npm ERR! Please include the following file with any support request:
npm ERR!     /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/npm-debug.log

npm WARN gitbook-plugin-livereload@4.0.0-alpha.4 license should be a valid SPDX license expression
npm ERR! Darwin 16.4.0
npm ERR! argv "/Users/huatai/.nvm/versions/node/v6.9.4/bin/node" "/Users/huatai/.nvm/versions/node/v6.9.4/bin/npm" "install"
npm ERR! node v6.9.4
npm ERR! npm  v3.10.10
npm ERR! code ELIFECYCLE
npm ERR! gitbook-plugin-livereload@4.0.0-alpha.4 prepublish: `npm run build-js`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the gitbook-plugin-livereload@4.0.0-alpha.4 prepublish script 'npm run build-js'.
npm ERR! Make sure you have the latest version of node.js and npm installed.
npm ERR! If you do, this is most likely a problem with the gitbook-plugin-livereload package,
npm ERR! not with npm itself.
npm ERR! Tell the author that this fails on your system:
npm ERR!     npm run build-js
npm ERR! You can get information on how to open an issue for this project with:
npm ERR!     npm bugs gitbook-plugin-livereload
npm ERR! Or if that isn't available, you can get their info via:
npm ERR!     npm owner ls gitbook-plugin-livereload
npm ERR! There is likely additional logging output above.

npm ERR! Please include the following file with any support request:
npm ERR!     /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/gitbook-plugin-livereload/npm-debug.log
```

参考 [Error: Couldn't find preset “es2015” relative to directory “/Users/username”](http://stackoverflow.com/questions/34819473/error-couldnt-find-preset-es2015-relative-to-directory-users-username) 先执行

```
npm install babel-cli babel-preset-es2015
```

但是报错依旧，另外发现`./_assets/plugin.js`文件内容是空的

尝试重新安装一次（重新安装前先全局安装一次 `babel-cli babel-preset-es2015`）

```
gitbook uninstall 4.0.0-alpha.4
unlink ~/.gitbook/versions/latest
npm install babel-cli babel-preset-es2015 -g

gitbook fetch pre
cd ~/.gitbook/versions
ln -s 4.0.0-alpha.4 latest

cd 4.0.0-alpha.4/node_modules/gitbook-plugin-livereload
npm install
```

**没有解决，暂时放弃尝试，回退到稳定版本**

```
cd ~/.gitbook/versions
unlink latest

gitbook uninstall 4.0.0-alpha.4
gitbook update
```

> 此时安装版本是稳定版本3.2.2

重新安装文档目录中的插件

```
cd ~/my_gitbook
gitbook install
```

* 无法找到`gitbook-core`模块

还有报错

```
Error: Cannot find module 'gitbook-core'
```

尝试再次安装`gitbook-core`模块

```
cd /Users/huatai/.nvm/versions/node/v6.9.4/lib/node_modules/gitbook-cli
npm i gitbook-core -g
```

> 必须进入`lib/node_modules/gitbook-cli`才能执行上述安装命令，需要读取该目录下的`package.json`

* `TypeError: Cannot read property 'Page' of undefined`

修复了`gitbook-core`模块问题后，又遇到不能读取Page属性问题

```
error: error while generating page "README.md":

TypeError: Cannot read property 'Page' of undefined
```

使用 `gitbook -d serve` 命令详细排查显示错误

```
...
    at /Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/immutable/dist/immutable.js:2701:43
    at List.__iterate (/Users/huatai/.gitbook/versions/4.0.0-alpha.4/node_modules/immutable/dist/immutable.js:2208:13
```

显示报错和模块`immutable`有关



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

> 上述方法并没有成功，我也尝试重新安装`gitbook-cli`，发现`gitbook-cli`安装的`2.3.0`版本自动安装了`gitbook 3.2.2`。所以暂时采用在更新了多个文档之后，只执行 `gitbook build` 生成静态文件，大多数情况下并不需要实时编译。

# 参考

* [GitBook使用指南](http://wanqingwong.com/gitbook-zh/)
* [GitBook Help](https://www.gitbook.com/book/gitbookio/documentation/details)
* [使用Gitbook制作电子书](http://www.ituring.com.cn/article/127645)
* [使用GitBook平台发布电子书](http://www.ituring.com.cn/article/127744)
* [GitBook, Git + Markdown 快速发布你的书籍](http://leeluolee.github.io/2014/07/22/2014-07-22-gitbook-guide/)