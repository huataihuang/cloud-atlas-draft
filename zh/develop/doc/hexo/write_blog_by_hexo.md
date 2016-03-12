# 安装hexo

推荐`nvm`来管理`node.js`版本，请参考[nvm官方说明](https://github.com/creationix/nvm)

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash

	nvm install 4.3.0
	nvm alias default 4.3.0

> 目前测试下来，在一些插件兼容性上使用最细的 v5.x 会产生异常，此外，在gitbook的运行中发现，使用 node v5.x 出现cpu资源占用较高问题。所以，目前（2016年2月）还继续使用node.js v4.3.0（长期支持版）。
>
> 如果使用[node.js官方pkg包](http://nodejs.org)安装，会在系统级别安装到`/usr/local`目录下，但是对于hexo安装，总是需要使用sudo权限，非常不方便。

安装Hexo

	npm install hexo-cli -g

先使用`hexo`初始化目录，这个目录名字可以是任意名称，最好和你的网址同名。这里我使用自己的个人网站`huataihuang.github.io`

	hexo init huataihuang.github.io
	cd huataihuang.github.io
	npm install

启动服务

	hexo server

> 此时默认端口监听`4000`，可以通过参数 `-p 3999` 修改监听端口（如果在主机上运行多个服务）

# 使用hexo

> 默认的theme是`landscape`，后面再讲述如何定制theme

在 [github](https://github.com) 上创建自己的账号，并以自己的`账号名字+github.io`作为仓库名（参考[github pages说明](https://pages.github.com)）。例如，我的github账号是`huataihuang`，则创建的仓库名字是`huataihuang.github.io`

> 发布需要设置自己账号的公钥，即将管理密钥设置为**ssh公钥**

在 `_config.yml` 中添加如下配置，表示使用github进行部署

    # Deployment
    ## Docs: http://hexo.io/docs/deployment.html
    deploy:
      type: git
      repo: https://github.com/huataihuang/huataihuang.github.io.git
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

# 升级hexo

再次进入 `huataihuang.github.io` 目录，执行

	npm update -g

# 文档撰写

文档采用GitHub favored Markdown格式，可以支持[表格、代码着色、高级引用](https://help.github.com/articles/working-with-advanced-formatting/)等功能，非常适合代码分享。

