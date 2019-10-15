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