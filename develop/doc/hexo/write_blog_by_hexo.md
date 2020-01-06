# 安装nvm管理node.js安装

推荐`nvm`来管理`node.js`版本，请参考[nvm官方说明](https://github.com/creationix/nvm)

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

脚本在 `~/.nvm` 目录下clone了`nvm`的git仓库，并在`~/.bash_profile`， `~/.zshrc`， `~/.profile` 或 `~/.bashrc` 中添加了

```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
```

不过，如果你的用户目录下没有上述profile文件，则不会自动添加。例如，最新的macOS Catalina默认使用zsh，在用户目录下默认并没有自己的profile。请参考 [oh-my-zsh](../../shell/zsh/oh-my-zsh)进行设置。

> 升级`nvm`也可以使用上述安装命令，会自动检测当前系统已经安装的`nvm`版本并使用git升级。

> 如果在Mac OS X中执行`nvm`命令提示`nvm: command not found`，则可能在执行上述脚本的时候，系统中尚未有`~/.bash_profie`，请先执行`touch ~/.bash_profile`，然后再执行一遍安装脚本

按照hexo官方文档，应该安装node.js的稳定版本

```
nvm install stable
```

可以安装指定版本node（如果需要特定的兼容特性）

```
nvm install 4.6.0
nvm alias default 4.6.0
```

> 早期使用nodejs，例如，2016年2月测试在一些插件兼容性上使用最细的 v5.x 会产生异常，此外，在gitbook的运行中发现，使用 node v5.x 出现cpu资源占用较高问题。不过，我在2016年10月采用最简单的typing模版时，使用最新的`6.7.0`系列发现无法正常显示，所以还是当时指定采用了4.6.0
>
> 如果使用[node.js官方pkg包](http://nodejs.org)安装，会在系统级别安装到`/usr/local`目录下，但是对于hexo安装，总是需要使用sudo权限，非常不方便。所以推荐使用`nvm`作为node.js的包管理。

## 升级node.js

使用一段时间后，官方node.js长期稳定版本可能升级，例如，使用

```
nvm ls-remote --lts
```

可以看到

```
->       v4.6.0   (LTS: Argon)
         v4.6.1   (Latest LTS: Argon)
```

```
nvm install 4.6.1
nvm alias default 4.6.1
nvm uninstall 4.6.0
```

提示报错

```
nvm: Cannot uninstall currently-active node version, v4.6.0 (inferred from 4.6.0).
```

解决方法是（参考 [nvm: Cannot uninstall currently-active node version](http://stackoverflow.com/questions/38775287/nvm-cannot-uninstall-currently-active-node-version)）

```
nvm deactivate 4.6.0
nvm uninstall 4.6.0
```

此时还要再进行一次 `nvm install 4.6.1` 以便将当前活跃版本指向4.6.1

# 安装hexo

安装Hexo

	npm install hexo-cli -g

先使用`hexo`初始化目录，这个目录名字可以是任意名称，最好和你的网址同名。这里我使用自己的个人网站`blog.huatai.me`

	hexo init blog
	cd blog
	npm install

启动服务

	hexo server

> 此时默认端口监听`4000`，可以通过参数 `-p 3999` 修改监听端口（如果在主机上运行多个服务）

* 升级hexo

使用一段时间，官方软件版本有所更新，可以使用如下命令升级

```
npm update -g
```

不过，遇到升级了node.js版本之后，再执行`hexo new "xxxx"`提示模块版本不一致

```
Error: Module version mismatch. Expected 48, got 46.
```

解决方法参考 [升级Node.js v6.0.0之后无法编译 #1939](https://github.com/hexojs/hexo/issues/1939) [Node.js – Error: Module version mismatch. Expected 48, got 46.](http://blog.jonathanargentiero.com/node-js-error-module-version-mismatch-expected-48-got-46/) 原理类似，在程序目录执行删除模块目录，然后重新安装模块

```
rm -rf node_modules/
npm i --no-optional
```

或

```
rm -rf node_modules && npm install
```

# Typing主题

> 最初，想回归最简单的文字主题，采用 [Maupassant](https://github.com/tufu9441/maupassant-hexo) ，参考 [大道至简——Hexo简洁主题推荐](https://www.haomwei.com/technology/maupassant-hexo.html)进行设置。不过，geekplux的[typing](https://github.com/geekplux/hexo-theme-typing)似乎更为简洁，所以准备入手。

    cd blog
	git clone https://github.com/geekplux/hexo-theme-typing themes/typing

修改`_config.yml`将`theme`设置成`typing`

如果要更新：

    cd themes/typing
	git pull

> [landscape](https://github.com/hexojs/hexo-theme-landscape)这个默认主题也不错，除了代码高亮不是很舒服，作为写个人博客还是很适合的。

# 使用hexo

> github提供了一个[pages](https://pages.github.com)服务，可以将自己账号名同名的repo作为对外展示blog的仓库。即在[github](https://github.com) 上创建自己的账号，并以自己的`账号名字+github.io`作为仓库名（参考[github pages说明](https://pages.github.com)）。例如，我的github账号是`huataihuang`，则创建的仓库名字是`huataihuang.github.io`
>
> 默认使用的是 [Jekyll](https://github.com/jekyll/jekyll) 作为静态页面平台（使用Ruby生成静态blog）

> 发布需要设置自己账号的公钥，即将管理密钥设置为**ssh公钥**

在 `_config.yml` 中添加如下配置，表示使用github进行部署

    # Deployment
    ## Docs: http://hexo.io/docs/deployment.html
    deploy:
      type: git
      repo: https://github.com/huataihuang/nebula.git
      branch: master

安装git插件

    npm install hexo-deployer-git --save

创建一个新的post，使用如下命令（默认的layout是位于`source/_posts`）

    hexo new "18 Til I Die"

此时提示 `INFO  Created: ~/Documents/blog/huataihuang.github.io/source/_posts/18-Til-I-Die.md` ，则编辑此文件来撰写blog。

撰写新的post之后，使用命令

    hexo g
    hexo d

> `g` 表示 `generate`

> `d` 表示 `deploy`，即部署到github的页面，然后就可以通过访问 http://huataihuang.github.io 看到自己的页面

# 创建about页面

```bash
hexo new page about
```

会在source/about中生成index.html。这个就叫做页面，不在文章列表显示，可以通过http://localhost/about浏览。

页面支持文章的大部分属性，除了分类和标签。

# 增加Disqus评论功能

hexo内置支持了disqus评论功能，只需要在 `_config.yml` 配置中添加（需要先到disqus上申请域名）

    # Disqus
    disqus_shortname: bloghuataime



# 设置域名

我的blog的域名是 `blog.huatai.me` ，在反复折腾了几次VPS之后，还是决定专注blog撰写，将维护工作交给github处理。也就是将`blog.huatai.me`域名指向`huataihuang.github.io`。

> 参考[Setting up a custom domain with GitHub Pages](https://help.github.com/articles/setting-up-a-custom-domain-with-github-pages/)

* 在hexo的`source`目录下存放一个`CNAME`文件，内容就是你希望托管的域名。这里我将`blog.huatai.me`域名托管，所以这个`CNAME`文件内容就是`blog.huatai.me` （参考[Using own domain with github and hexo](http://readorskip.com/2015/06/08/Using-own-domain-with-github-and-hexo/)）
* 在域名服务商（我使用[狗爹](https://www.godaddy.com)）的域名管理中添加一个`CNAME记录`

        blog  CNANME  huataihuang.github.io.

域名生效后，访问 http://blog.huatai.me 就会访问 http://huataihuang.github.io 并且看到完全一致的页面

# 插件

* [hexo-generator-feed](https://github.com/hexojs/hexo-generator-feed) ->生成rss
* [hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap) ->生成sitemap
* [hexo-pdf](https://github.com/superalsrk/hexo-pdf/) ->嵌入pdf
* [hexo-qiniu-sync](https://github.com/gyk001/hexo-qiniu-sync) ->插入图片外链，并且同步你的文件到七牛云(暂未使用)

# 升级hexo

再次进入 `huataihuang.github.io` 目录，执行

	npm update -g

# 文档撰写

文档采用GitHub favored Markdown格式，可以支持[表格、代码着色、高级引用](https://help.github.com/articles/working-with-advanced-formatting/)等功能，非常适合代码分享。

# 其他静态blog

* 使用github issue撰写博客

没有想到的是，也有人直接使用[GitHub的Issues搭建了一个名为"lifesinger"的个人博客](https://github.com/lifesinger/blog/issues)，因为issue天然支持MarkDown并且可以开放式讨论，倒是也别有趣味。

* jekyll 和 Octopress

jekyll是GitHub官方支持的Pages工具，基于Ruby，由于github巨大的影响力使用非常广泛。Octopress则是Jekyll的定制简化，但依然比较折腾。根据网上的一些评测，对于大量的文档创建，hexo相对速度较快。

> 考虑到每个人的生活是多面的，我准备使用`hexo`(`typing` theme)来构建生活的blog，而使用`jekyll`来构建偏向技术的blog。

> 参考 [FarBox、Jekyll、Octopress、ghost、marboo、Hexo、Medium、Logdown、prose.io，这些博客程序有什么特点？](https://www.zhihu.com/question/21981094)

# 其他blog

如果没有被墙，其实用[twitter](https://twitter.com/)记录碎片化的思绪，用[tumblr](https://www.tumblr.com/)撰写生活随笔，是非常惬意和轻松的事情。

# 参考

* [from jekyll to hexo](https://kangqingfei.cn/2015/12/30/from-jekyll-to-hexo/)
* [Hexo 入门指南（四） - 页面、导航、边栏、底栏](http://blog.csdn.net/wizardforcel/article/details/40684953)