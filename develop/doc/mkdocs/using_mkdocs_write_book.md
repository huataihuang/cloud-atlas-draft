我使用[gitbook](../gitbook/README)撰写日常技术笔记已经很久了，但是非常麻烦的是，`gitbook build`非常缓慢并且消耗资源。所以，我撰写[Cloud Atlas](https://github.com/huataihuang/cloud-atlas)改为采用[Sphinx Doc](http://www.sphinx-doc.org/)。

不过，[reStructuredText](http://docutils.sourceforge.net/rst.html)语法比较复杂，日常轻量级的文档撰写比较累，所以我一直想如何更方便地记录个人工作笔记。我发现[MkDocs](https://www.mkdocs.org/)采用了Python作为运行平台，markdown作为撰写语法，并且界面简洁，可能是比较好的的笔记平台。

> 所有的静态网站文档工具，在最初搭建架构时候比较痛苦，但是在逐步完善了体系之后，只需要填充内容，则非常方便易用。需要跨越这个最初比较陡峭的阶段。

# 安装

> 我已经在[Sphinx](develop/doc/sphinx/README)采用了[Python3和virtualenv环境](develop/python/startup/install_python_3_and_virtualenv_on_macos)，所以同样也在Python的virtualenv中安装MkDocs。

```
pip3 install virtualenv
pip3 install --upgrade pip

cd ~
virtualenv venv3
. venv3/bin/activate

pip install mkdocs
```
* 检查版本

```
mkdocs --version
```

# 使用

* 创建项目

```
mkdocs new my-project
cd my-project
```

在目录下有一个 `mkdocs.yml` 文件，以及 `docs` 目录包含了文档源代码，当前仅在 `docs` 目录下有一个 `index.md` 文件。

MkDocs自带了一个dev-server，可以用于预览文档：

```
mkdocs serve
```

此时浏览器访问 http://127.0.0.1:8000 可以看到文档。并且 dev-server 支持自动重新加载，即对于配置文件中指定的文档目录，任何修改和theme变化都会重新渲染文档。

* 编辑 `docs/index.md` ，修改第一行 `# Welcome to MkDocs` ，例如修改成 `# 我的工作` ，保存立即可以看到首页重新加载刷新。

* 编辑配置文件 `mkdocs.yml` 修改 `site_name` 配置

## 添加页面

* 添加第二个 `docs/about.md` 内容也是MarkDown：

```markdown
# 说明

## 目标

整理工作中的技术、管理以及日常
```

保存以后，在网站最上方的导航栏就会但看到有两个

## 文档风格

* 编辑 `mkdocs.yml` 配置，添加 `theme` 设置:

```
site_name: MkLorum
nav:
    - Home: index.md
    - About: about.md
theme: readthedocs
```

则会看到 ReadTheDocs 风格。

参考 推荐采用 [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) 风格，这是一款遵循了Google [Material Design](https://material.io/design/) 的theme，可以看到及其类似Google官方文档的设计风格。

```
pip install mkdocs-material
```

然后修订 `mkdocs.yml` 设置:

```
theme:
  name: 'material'
```

* 语法高亮使用 [codeHilite](https://python-markdown.github.io/extensions/code_hilite/) 扩展

首先安装 pygments

```
pip install pygments
```

> 搜索功能只支持英文，遗憾

# 构建网站

如果预览都正常，则可以开始部署，首先build文档:

```
mkdocs build
```

则生成一个新的目录 `site` ，在增目录下有生成的文档html

如果使用git管理，一般不需要将 `site/` 目录下的html文件也存储到仓库，则配置 `.gitignore` 文件:

```
echo "site/" >> .gitignore
```

要清理掉 `site` 目录下生成掉网站文件:

```
mkdocs build --clean
```

> 我发现从0开始撰写文档并不容易，因为没有摸到规律。但是，可以模仿网上已经完整体系的mkdocs文档来撰写。例如 [glusterdocs](https://github.com/gluster/glusterdocs)

# 中文搜索

> 目前还没有折腾出来

在mkdocs-material官方issue中有 [Seperate search language and theme language setup #531](https://github.com/squidfunk/mkdocs-material/issues/531) 指出：

mkdocs-material是通过 `lunr.js` 来实现搜索的，仅支持日语，但实际上日语的搜索设置也可以用于中文。

[About Chinese search #524](https://github.com/squidfunk/mkdocs-material/issues/524) 提示了支持搜索是修改 `/Library/Python/2.7/site-packages/mkdocs/assets/search/mkdocs/js/lunr.min.js` 

我检查了virtualenv环境中， `lib/python3.8/site-packages/mkdocs/contrib/search/lunr-language/` 包含了各种语言搜索，其中就有 `lunr.jp.js`

参考 [基于mkdocs-material实现的帮助中心(markdown + 中文搜索 + 图片放大)](https://segmentfault.com/a/1190000018592279) / [Seperate search language and theme language setup #531](https://github.com/squidfunk/mkdocs-material/issues/531) / [7. 支持中文搜索](https://cyent.github.io/markdown-with-mkdocs-material/appendix/search/) ：

* mkdocs-masterial 是支持中文搜索的，但是需要设置为 `jp` :

```yaml
extra:
  search:
    language: 'jp'
```

* mkdocs是通过 lunr 实现搜索功能，原理是提取页面纯文本内容奥一个json文件爱你，包含锚点位置、标题、描述及标题与描述对应的分词库；把搜索框输入的内容根据分隔符(空格、标点符号等)切分分词，并和第一步的分词库进行对比，根据对应锚点寻址页面。

* 英文版的lunr现在已经支持日文。这种机制是，lunr分词是由分隔符导向，同时对词长有一定限制，类似这种汉字过多的成句，只能保留每段分割的前两个字。所以在搜索的时候，成句（一般是大于俩字）目前是搜索不到的，但可以通过空格切割成句进行搜索。

----

我发现我的 `mkdocs serve` 启动有一个提示:

```
Ignore: /home/huatai/venv3/lib/python3.8/site-packages/mkdocs/contrib/search/templates/search/lunr.js
```

# 定制

* 设置logo：图片文件可以存放在 `docs/images` 目录下，图片会自动缩放到合适大小

```
theme:
  logo: 'images/logo.svg'
```

并且可以使用默认的icon:

```
theme:
  logo:
    icon: 'cloud'
```

* 多国语言搜索

中文采用 `jp` ，注意只加载需要的语言搜索，否则会占用过多内存

```
extra:
  search:
    language: 'en, jp'
```

# 插件

## PDF输出插件

* [MkDocs PDF Export Plugin](https://github.com/zhaoterryy/mkdocs-pdf-export-plugin)