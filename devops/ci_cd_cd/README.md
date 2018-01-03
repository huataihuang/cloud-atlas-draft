# 持续集成概念

> 本段文字摘自阮一峰的文章《[持续集成是什么？](http://www.ruanyifeng.com/blog/2015/09/continuous-integration.html)》

持续集成指的是，频繁地（一天多次）将代码集成到主干。

它的好处主要有两个：

* 快速发现错误。每完成一点更新，就集成到主干，可以快速发现错误，定位错误也比较容易。
* 防止分支大幅偏离主干。如果不是经常集成，主干又在不断更新，会导致以后集成的难度变大，甚至难以集成。

持续集成的目的，就是让产品可以快速迭代，同时还能保持高质量。它的核心措施是，代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。

Martin Fowler说过，"持续集成并不能消除Bug，而是让它们非常容易发现和改正。"

# 


# 参考

* [持续集成是什么？](http://www.ruanyifeng.com/blog/2015/09/continuous-integration.html)
* [维基百科:持续交付](https://zh.wikipedia.org/zh-cn/%E6%8C%81%E7%BA%8C%E4%BA%A4%E4%BB%98)
* [如何理解持续集成、持续交付、持续部署？](https://www.zhihu.com/question/23444990)
* [谈谈持续集成，持续交付，持续部署之间的区别](http://blog.flow.ci/cicd_difference/)