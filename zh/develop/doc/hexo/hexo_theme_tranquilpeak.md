# `tranquilpeak` theme安装

美观并且有活跃开发的[Tranquilpeak](https://github.com/LouisBarranqueiro/hexo-theme-tranquilpeak)

```bash
cd themes
wget https://github.com/LouisBarranqueiro/hexo-theme-tranquilpeak/releases/download/v1.6.2/hexo-theme-tranquilpeak-built-for-production-1.6.2.zip
unzip hexo-theme-tranquilpeak-built-for-production-1.6.2.zip
mv hexo-theme-tranquilpeak-built-for-production-1.6.2 tranquilpeak
```

> 参考 [this theme does not work well with me #203](https://github.com/LouisBarranqueiro/hexo-theme-tranquilpeak/issues/203) ，如果是采用`git`方式获取源代码，则要自己build，否则无法工作只能看到没有任何css的丑陋页面。
>
> 只有使用[tranquilpeak v1.6.2 zip包](https://github.com/LouisBarranqueiro/hexo-theme-tranquilpeak/releases/download/v1.6.2/hexo-theme-tranquilpeak-built-for-production-1.6.2.zip) 才可直接使用

如果是git方式安装，使用如下命令

```bash
git submodule add https://github.com/LouisBarranqueiro/tranquilpeak-hexo-theme themes/tranquilpeak
cd themes/tranquilpeak

# install bower and grunt if not already installed
npm install -g bower grunt-cli

npm install
bower install
grunt build
```

> 上述方法参考 [Hexo, Travis, S3 - Part 1: Hexo basics](http://inject.coffee/hexo-travis-s3-part-1-hexo-basics/)

# `tranquilpeak`设置

修改`hexo`根目录下 `_config.yml`

```yaml
theme: tranquilpeak
post_asset_folder: true
```

> 设置`post_asset_folder`可以使用到封面图像，缩略图图像和照片展示等功能。

## `tranquilpeak`详细定制

> 定制化的配置都要在`theme/tranquilpeak/_config.yml`完成，这个配置文件的优先级较高，并且很多原先在`hexo`根目录下`_config.yml`设置内容可能不能生效。
>
> 默认的`theme/tranquilpeak/_config.yml`配置已经足够好，我发现其实并没有需要修改的地方

* Sidebar

**不要修改** 变量名 `sidebar`, `title`, `url` and `icon`

其他变量名引用菜单或链接可以修改，例如 `menu`, `home`, `categories`

> 这部分可以保持默认配置

* Header

`Header`是指阅读文档时候头部，例如可以定制

```yaml
header:
     right_link:
         url: /#about
         icon: question
         class:
```

这样在阅读文档的右上角就会有一个"?"图标，点击就会显示`about`页面

也可以按照推荐设置

```yaml
header:
    right_link:
        url: /#search
        icon: search
        class: st-search-show-outputs
```

* Author

```yaml
# Author
author:
    email:
    location:
    picture:
    twitter:
    google_plus:
```

> `picture` 位于 `source/assets/images/`（production） 目录下指定一个图片
> 
> 如果设置了`gravatar_email`就会覆盖这里设置的`author.picture`。不过，我发现可能显示不出（被墙）。

* Customization

```yaml
# Customization
sidebar_behavior: 2
toc_title: Table of contents
thumbnail_image: true
thumbnail_image_position: right
auto_thumbnail_image: true
cover_image: cover.jpg
favicon:
image_gallery: true
archive_pagination: true
category_pagination: true
tag_pagination: true
```

> `sidebar_behavior` 默认配置是`2`，也就是显示一个较缩略的导航栏，我将这个数值调整成`1`，这样就显示宽幅的导航栏（只有这种宽幅方式才能显示author的头像）
>
> 其他定制请参考原文

* Integrated services

```yaml
# Integrated services
disqus_shortname:
duoshuo_shortname:
gravatar_email: 
google_analytics_id:  
swiftype_install_key:
fb_admin_ids:
fb_app_id:
```

> 这里主要设置 `disqus_shortname` 以便能够显示Disqus的评论

# 激活页面

`Tranquilpeak`提供了3个页面来显示所有的`posts`和按照时间排序的`posts`，请分别按照以下步骤执行，否则无法在页面上点击`tags`和`categories`功能。

## 激活`all-categories`页面

执行命令

```bash
	hexo new page "all-categories"
```

然后将 `source/all-categories/index.md` 替换为

```markdown
---
title: "all-categories"
layout: "all-categories"
comments: false
---
```

> 这样就会在`/all-categories`创建页面，访问者可以在这里搜索和过滤分类

## 激活`all-tags`页面

执行命令

	hexo new page "all-tags"

然后将 `source/all-tags/index.md` 替换为

```markdown
---
title: "all-tags"
layout: "all-tags"
comments: false
---
```

## 激活`all-archives`页面

执行命令

```bash
	hexo new page "all-archives"
```

然后将 `source/all-archives/index.md` 替换为

```markdown
---
title: "all-archives"
layout: "all-archives"
comments: false
---
```

# 安装插件

前述的theme都配置启用了`rss`，需要安装插件`hexo-generator-feed`

添加生成RSS和sitemap的插件

```bash
    npm install hexo-generator-feed --save
```

目录下的`_config.yml`文件添加以下内容

```yaml
feed:
  type: atom
  path: atom.xml
  limit: 20
```

# 参考

* [User documentation](https://github.com/LouisBarranqueiro/hexo-theme-tranquilpeak/blob/master/docs/user.md)