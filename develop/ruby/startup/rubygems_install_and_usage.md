# RubyGems简介

[RubyGems](https://rubygems.org/)是Ruby开发语言的包管理器，提供了分发Ruby程序和库的标准格式。这个工具被设计成易于安装gem，并且可以使用服务器来分发。RubyGems创建于2003年，从Ruby 1.9开始成为标准库。

# 安装

在CentoOS 7.x上，只需要安装`ruby`(当前是ruby 2.0)就可以同时安装`rubygems`

    yum install ruby

设置RubyGems源：将gem源替换成taobao（官方网站在景德镇访问非常缓慢，甚至无法访问）

	gem sources --remove https://rubygems.org/
	gem sources -a https://ruby.taobao.org/
	gem sources -l

# 使用

RubyGems使用非常类似`apt-get`和`yum`

安装软件包

    gem install mygem

卸载软件包

    gem uninstall mygem

列出已经安装的gems

    gem list --local

显示可用的gems

    gem list --remote

创建所有gems的RDoc文档

	gem rdoc --all

下载gem但不安装

	gem fetch mygem

所有可用的gems

	gem search STRING --remote

gem命令还可以用来创建和维护`.gemspec`和`.gem`文件：从`.gemspec`文件创建`.gem`

	gem build mygem.gemspec

# 参考

* [Wikipedia:RubyGems](https://en.wikipedia.org/wiki/RubyGems)