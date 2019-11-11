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

