> 经过试用Moin 2.0 Alpha，暂时决定采用Sphinx来整理汇总工作笔记，个人知识库可能会等自己更为熟练使用ReStructureText格式之后再采用。另外，Moin 2.0的theme调整方法还需要学习，例如css。

[MoinMoin](http://moinmo.in/)是一个易于使用和扩展，并且适合大规模用户组织使用的Wiki引擎。

作为知识管理，我使用过非常精巧的[TiddlyWiki](https://tiddlywiki.com)，也自己搭建过维基百科所使用的强大的[MediaWiki](https://www.mediawiki.org)。然而最终都发现各有限制而`考虑`选择MoinMoin：

* [TiddlyWiki](https://tiddlywiki.com)采用了单个html文件，通过js来实现个人KMS管理：
  * 优点：跨平台，非常容易备份和复制
  * 缺点：单个文件导致大量的文档存储和加载缓慢消耗内存
* [MediaWiki](https://www.mediawiki.org)采用PHP开发，是世界最大百科图书使用引擎
  * 优点：经过大规模验证，大型组织应用广泛
  * 缺点：基于PHP，需要使用MySQL数据库，部署和迁移非常麻烦

选择 MoinMoin 的原因是：

* 基于Python开发
* 最新2.0系列采用支持多种Markup语法（MoinWiki, Restructured Text, Docbook XML, Mediawiki, Markdown），其中包括我心仪已久[Sphinx Doc](http://www.sphinx-doc.org)的reStructuredText格式（Python开发的文档标准格式）。

MoinMoin的（`可能`）不足：

* 实践发现MoinMoin还是比较复杂，当wiki文档不断修改则会生成大量的随机字符串作为文件名的文件。从文件系统而言并非直观理解。
* Moin 2.0似乎还有不少bug（Alpha），目前试用发现文档导引似乎在反复修改内部链接有展示问题
* 目前还没有想好wiki的文档结构，准备用脑图先梳理一遍。但是梳理脑图的话，似乎就可以直接转换成Sphinx文档了。

> 或许采用Sphinx来组织个人知识？

详细的 [MoniMoin 2](https://moin-20.readthedocs.io/en/latest/) 官方手册介绍了所有相关知识。

> 请参考重量级开源组织：
>  * [Ubuntu社区 Help Wiki](https://help.ubuntu.com/community/) 采用MoinMoin撰写文档
>  * [Apache wiki](https://wiki.apache.org/) Apache开源组织官方Wiki
>  * [Gnome wiki](https://wiki.gnome.org) Gnome桌面官方Wiki
>  * [Kernelnewbies社区wiki](https://kernelnewbies.org)  内核新手社区采用MoinMoin
>  * [The Linux Kernel documentation](https://www.kernel.org/doc/html/v4.20/index.html) [使用Sphinx撰写内核文档](https://www.kernel.org/doc/html/v4.20/doc-guide/index.html)

* 采用MoinMoin撰写离散的知识点，最终汇总成完全相同文档格式的Sphinx Doc，以便能够整理成系统化的手册
* 无需数据库（也可以使用数据库），并且可以支持文件系统扩展 - 甚至我考虑采用分布式文件系统来满足大规模的网站部署
* 既可以小型化（例如单机是使用），也可以扩展成企业级的wiki知识系统

# MoinMoin资料

* [MoinMoin 2官方手册](https://moin-20.readthedocs.io/en/latest/)