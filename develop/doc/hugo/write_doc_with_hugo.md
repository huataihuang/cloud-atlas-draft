# 为什额是Hugo

Hugo是一个快速和现代化的静态网站生成工具，使用Go语言编写。为什么要使用静态化网站，是因为随着技术发展，原先需要服务端动态生成页面的工作，很多已经通过JS技术由客户端(浏览器)实现了，静态WEB页面可以提供极高的访问性能，对于大型WEB服务海量用户非常有利。并且静态化网站可以结合CDN技术，使得承载能力成倍提升。此外，静态网站不需要数据库支持，也不需要运行Ruby/Pthon/PHP这样虽然开发迅速但是运行效率较低的语言支持。

Hugo可以用来构建blog，CMS，或者公司/个人的知识库文档：

- 性能卓越：每个页面小于1ms
- 跨平台
- 运行时可以更改渲染器
- 强大的多样性风格
- 适合任何主机托管

# 安装

- MacOS中安装hugo:

```
brew install hugo
```

- Windows中安装hugo:

```
choco install hugo -confirm
```

- Linux中安装hugo:

```
snap install hugo
```

# 创建新站点

- 使用以下命令创建新站点，例如 myworks

```
hugo new site works
```

上述命令创建了一个基本的 `works` 目录

- 查看 [themes.gohugo.io](https://themes.gohugo.io/) 选择一个喜欢的theme，官方文档推荐了 [Ananke theme](https://themes.gohugo.io/gohugo-theme-ananke/)，不过，你也可以参考一下 [Hugo Showcase](https://gohugo.io/showcase/) 提供的成功案例，其中有些Case还提供了github源代码可以完整参考，有些提供了网站构建所采用的技术堆栈介绍，可以作为解决方案参考:

  - [linode Doc](https://github.com/linode/docs)
  - [Tomango](https://github.com/trys/tomango-2018) - Tomango 也是另一个Case [Hartwell Insurance](https://gohugo.io/showcase/hartwell-insurance/) 的构建方
  - [Hugo官方网站](https://github.com/gohugoio/hugoDocs)

> 不过，要实现美观而独特的Huge页面需要CSS和JS知识，我相信需要更为扎实的学习，来实现 [Android 官方文档](https://developer.android.com/docs) 简洁美观清晰的书籍。

## 文档型Hugo

参考 [Hugo Document Tag](https://themes.gohugo.io/tags/documentation/) ，其中比较美观的文档类型有:

- [Book](https://themes.gohugo.io//theme/hugo-book/) - 传统的3列文档网站，配色简洁，可能最接近Android官方文档，或许是定制的基础
- [Hugo-theme-learn](https://themes.gohugo.io/theme/hugo-theme-learn/en) - 类似ReadTheDoc风格，比较规范，配色更为美观，可以作为书籍撰写
- [docuapi](https://themes.gohugo.io/theme/docuapi/#introduction) - 可以作为对外技术型文档选择，三列风格，动态效果出色：注意这个theme会使用所有的pages来构建一个单页面API文档，使用页面素材 `weight` 来控制页面顺序 （不知道数据量大的情况下是否影响载入，有点类似我以前使用的 [Tidlywiki](https://tiddlywiki.com/) 使用一个页面来完成整个网站）
- [Academic](https://themes.gohugo.io/theme/academic/) - 完善页面导航和各种风格展示的嵌入，可以构建复杂网站
- [Techdoc](https://themes.gohugo.io/hugo-theme-techdoc/) - 适合撰写技术文档，这个风格是Hugo的官方文档风格

## Blog类型

参考 [Hugo Document Tag]() ，我感觉比较完善的:

- [Hugo Initio](https://themes.gohugo.io/theme/hugo-initio/) - 非常具有现代气息的卡片型
- [Universal](https://themes.gohugo.io/theme/hugo-universal-theme/) - 最具有商业气质的网站，可以用作企业WEB网站，美轮美奂
- [Hugo future imperfect](https://themes.gohugo.io/theme/future-imperfect/) - 经典的blog风格，素雅，我感觉作为个人资料库也可以使用
- [Ananke](https://themes.gohugo.io/theme/gohugo-theme-ananke/) - Hugo推荐的案例风格，简洁美观
- [Swift](https://themes.gohugo.io/hugo-swift-theme/) - 首页结合了卡片

> * 从美观角度我比较倾向 [docuapi](https://themes.gohugo.io/theme/docuapi/#introduction) 和 [Universal](https://themes.gohugo.io/theme/hugo-universal-theme/)
> * 构建商业网站倾向于 [Academic](https://themes.gohugo.io//theme/academic/) 和 [Universal](https://themes.gohugo.io/theme/hugo-universal-theme/)
> * 从定制性角度，我感觉 [Book](https://themes.gohugo.io//theme/hugo-book/) 比较适合文档
> * 从阅读兼具一定美观，或许 [Hugo-theme-learn](https://themes.gohugo.io/theme/hugo-theme-learn/en) 比较合适
> * 个人资料整理或许可以采用 [Academic](https://themes.gohugo.io//theme/academic/)

# 我的选择

- 个人文档系统

数据量有限情况下，采用 [docuapi](https://themes.gohugo.io/theme/docuapi/#introduction) 构建

较为复杂的分类，建议采用 [Hugo官方网站的风格](https://gohugo.io/showcase/template/)，提供了良好的文档阅读结构

> 其中使用饿了[asciinema](https://asciinema.org/)来记录终端操作，非常巧妙

- 个人blog

如果构建丰富展示个人不同方向的（如果人生比较精彩），可以选择 [Universal](https://themes.gohugo.io/theme/hugo-universal-theme/)

如果人生简单明了，则选择 [Hugo Initio](https://themes.gohugo.io/theme/hugo-initio/) 

# Hugo site

# 使用

- 初始化仓库

```
cd works
git init
```

- 注意：Hugo必须首先选择一个theme才能使用，你可以从 [Hugo themes](https://github.com/gohugoio/hugoThemes) 一次性下载所有theme

```
git clone --depth 1 --recursive https://github.com/gohugoio/hugoThemes.git themes
```

也可以只安装一个theme:

```
cd themes
git clone URL_TO_THEME
```

可以定制自己的theme：

```
hugo new theme THEMENAME
```

- 生成第一个post

```
hugo new posts/my-first-post.md
```

> 此时会生成一个 `content/posts/my-first-post.md` 内容就是当前时间和标题

```
---
title: "My First Post"
date: 2019-11-11T21:02:51+08:00
draft: true
---
```

- 启动 Hugo服务

```
hugo server -D
```

- 浏览器访问 http://localhost:1313/

# 源代码安装

Hugo是使用Go编写的开源框架，可以从源代码编译，也可以直接下载可执行程序。

- 从Github下载源代码安装:

```
brew install go

git clone https://github.com/gohugoio/hugo

mkdir -p src/github.com/gohugoio
ln -sf $(pwd) src/github.com/gohugoio/hugo

export GOPATH=$(pwd)
go get  #获取依赖包的所有最新版本

go build -o hugo main.go
```

- 升级Hugo

- 安装Pygments (可选)

# 参考

- [Hugo静态网站生成器中文教程](http://nanshu.wang/post/2015-01-31/) - 这篇中文文档写得比较完善
