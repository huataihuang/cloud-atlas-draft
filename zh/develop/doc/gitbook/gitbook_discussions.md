# 评论

Gitbook可以生成HTML，因此它支持一些外部的JavaScript文件嵌入到HTML中，例如Google统计、Disqus评论系统等。

以下以页面中嵌入Disqus评论为例。

首先是安装Gitbook的Disqus插件。

$ npm install gitbook-plugin-disqus

然后建立一个book.json文件，其格式如下：

    {
      "plugins": ["disqus"],
      "pluginsConfig": {
        "disqus": {
          "shortName": "NAME-FROM-DISQUS"
        }
      }
    }

把上面的NAME-FROM-DISQUS修改为你在Disqus上的项目名即可。

再次运行命令：

    gitbook serve

并刷新浏览器，即可看到附加了Disqus评论的页面。

遇到一个错误提示"We were unable to load Disqus. If you are a moderator please see our [troubleshooting guide](https://docs.disqus.com/help/83/)."