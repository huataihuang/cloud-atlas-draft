# 设计模式和UML

在做开发设计的时候，需要有一个完整表述设计思路，同时又提供不断迭代改进的基础。

[UML 还有用吗？](https://www.zhihu.com/question/23569835) ，知乎上的这个问题讨论了UML的用途、局限以及现实中的应用。

[生活的艺术家](https://book.douban.com/subject/21355964/)李小龙对搏击领悟的真谛同样适合软件开发：不要争论最好的语言，而是用语言开发出有用的程序。

UML中的时序图对于理解程序逻辑，协作以及不断改进应该是有比较大的帮助的，其他面向对象的设计，也有可借鉴以及灵活使用的地方，所以，花一些时间学习及实践。

UML已经不再是热门的开发方法，能够找到的书籍不算很多，学习和参考：

* [UML用户指南](https://book.douban.com/subject/21266841/) - 作者是面向对象方法最早的倡导者、UML的创始人 - 本书作为参考标准
* [图说设计模式](http://design-patterns.readthedocs.io/zh_CN/latest/index.html) - 系统化介绍软件设计模式，其中第一章介绍了UML图形符号，是一本开发且完整的设计书
* [UML建模面向对象设计](http://blog.51cto.com/smartlife/category5.html)
* [UML时序图](http://blog.csdn.net/road2010/article/details/7265413) - 这篇文章对时序图解析非常详细

# UML工具

我的工作平台是 Fedora LXQt 桌面，所以关注开源的UML设计工具：

* [UML Designer](http://www.umldesigner.org/) - 基于Eclipse插件[Sirius](https://www.eclipse.org/sirius)，Java运行
* [Umbrello](https://umbrello.kde.org/) - KDE桌面环境的工具，适合LXQt环境
  * [Umbrello UML Modeller Handbook](https://docs.kde.org/trunk4/en/kdesdk/umbrello/index.html) - 使用手册
  * [Umbrello Features](https://umbrello.kde.org/features.php) - 功能列表
* [Papyrus](http://www.eclipse.org/papyrus/) - Eclipse插件，Java运行
* [Umple](http://cruise.site.uottawa.ca/umple/) - 使用Umple开发的面向模式的语言，在线工作，也是Eclipse插件
* [modelio](https://www.modelio.org/) - Java开发的工具，有社区版本
* [bouml](http://www.bouml.fr/index.html)

> 参考 [Quora: What are the best UML tools for Linux?](https://www.quora.com/What-are-the-best-UML-tools-for-Linux)

目前在Fedora发行版中已经包含了：

* Umbrello - 主要选择，因为其已经和KDE环境结合，适合最新的KDE环境
* Bouml - 基于Qt3，需要安装Qt3环境（所以占用更多磁盘空间），并且版本4.21，并非最新的7.3版本

两者都是采用Qt开发的开源工具，所以选择。