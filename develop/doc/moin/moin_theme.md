MoinMoin使用theme插件系统来修改风格，这样不需要改动核心代码。

# 安装theme

[ThemeMarket](https://moinmo.in/ThemeMarket)提供了可下载的theme，不过需要注意选择兼容所使用的MoinMoin版本。

需要在2个不同位置修改：

* 所有静态文件的目录：解压缩文件，存放到theme目录（包含2个目录：`css/`和`img/`）
* `data/plugin/theme`目录是theme代码存放位置：将theme脚本移动到这个目录（也就是theme同名的以.py结尾的文件）

此时theme已经安装好了，接下来就是 [配置](https://moinmo.in/HelpOnConfiguration)

# 参考

* [HelpOnThemes](https://moinmo.in/HelpOnThemes)