# TextMate简介

TextMate是一款非常优秀的代码编辑器，虽然不像Xcode那样具有复杂的交互设计功能，也没有idea jetbrains那样聪明的代码补全和提示，但是对于日常脚本开发、轻量级代码编写已经绰绰有余，并且由于专注所以非常轻量级。

# Markdown关闭`header-styles`

我虽然喜欢TextMate来编辑Markdown文档，但是很不喜欢文本编辑中出现`header-style`变大的字体。

网上google发现也有同好提出了这样的问题，解决之道见[In Textmate2, how do you disable the header-styles in Markdown documents?](http://stackoverflow.com/questions/16258302/in-textmate2-how-do-you-disable-the-header-styles-in-markdown-documents)

> 在`Bundles`菜单选择`Edit Bundles...`
>
> 选择bundle的 `Themes` 然后打开 `Settings`
>
> 在这里可以关闭掉每个`Markup: Heading #` 也可以修改字体。
>
> 注意：保存设置后需要重新打开文档使之显示生效

# 清新配色的TextMate 2（未使用）

> 参考 [My TextMate 2 Setup](http://hiltmon.com/blog/2013/04/15/my-textmate-2-setup/)

可以使用 [CombinedCasts](http://hiltmon.com/blog/2013/02/22/multiple-themes-in-textmate-2/) 用于文档编辑，直接下载 [CombinedCasts.tmTheme](http://hiltmon.com/files/CombinedCasts.tmTheme) 安装就可以。

# Markdown预览

这个Markdown预览应该最期待的特性，也是`Mou`编辑器的杀手锏（但是我不喜欢`Mou`编辑不能自动完成符号匹配），所以还是从TextMate来寻找解决方法。

> 其实很简单， **TextMate内建就支持Markdown预览** [TextMate Live Preview of GFM (GitHub flavored Markdown)](http://stackoverflow.com/questions/17923993/textmate-live-preview-of-gfm-github-flavored-markdown)
>
> 按下 "ctrl+alt+command+p" 就可以看到预览 （通过菜单 "Bundles > Markdown Redcarpet > Preview" 即可）
>
> 另外一个支持是可以将Markdown文档直接转换成html文档

要支持GitHub's Redcarpet Markdown，可使用 [TextMate Bundle for GitHub's Redcarpet Markdown](https://github.com/streeter/markdown-redcarpet.tmbundle)

# shell支持（用于scm编辑）

可以安装一个`mate`小应用来实现shell支持，这样在做`git commit`的时候就可以直接打开TextMate进行注释了，不必使用vim了。

![git textmate 2](/img/develop/mac/git_testmate2.png)

# 远程文件编辑

在远程ssh服务器上安装[rmate](https://github.com/textmate/rmate/)就可以实现

    gem install rmate

然后本地使用端口转发方式ssh到服务器上

    ssh -R 52698:localhost:52698 user@example.org

或者使用Unix sockets方式（OpenSSH v6.7以上版本）

    ssh -R /home/user/.rmate.socket:localhost:52698 user@example.org

此时，登录到服务器上执行命令

    rmate /etc/hosts

就会在本地的Mac桌面上启用TextMate进行编辑，保存文件的时候会保存到远程服务器上，非常方便对一些脚本进行修改，具备了语法高亮以及一些高级功能。

也可以单独安装到`HOME`目录下的`bin`子目录，提供给服务器上个人账号使用

	curl -Lo ~/bin/rmate https://raw.githubusercontent.com/textmate/rmate/master/bin/rmate
chmod a+x ~/bin/rmate

如果`~/bin`目录没有在自己的`PATH`搜索环境下，可以在`~/.profile`中添加

	export PATH="$PATH:$HOME/bin"

> `rmate`的配置文件是`/etc/rmate.rc`或`~/.rmate.rc`

	host: auto                   # Prefer host from SSH_CONNECTION over localhost
	port: 52698
	unixsocket: ~/.rmate.socket  # Use this socket file if it exists

也可以通过设置 `RMATE_HOST`, `RMATE_PORT`和`RMATE_UNIXSOCKET`环境变量来实现。

## 通过config配置设置TextMate rmate编辑文件

但是每次手工输入`ssh -R 52698:localhost:52698 user@example.org`命令显然是繁琐而无人性的，我们需要一个通用的配置文件来使得简单的`ssh`登录服务器就具备上述功能。

编辑 `~/.ssh/config` 在总的通用段落`Host *`添加`LocalForward 52698 localhost:52698`

	Host *
	    ServerAliveInterval 60
	    ControlMaster auto
	    ControlPath ~/.ssh/%h-%p-%r
	    ControlPersist yes
		LocalForward 52698 localhost:52698
		
这样，所有远程登录`ssh`后都会做这个端口转发，也就实现了上述`rmate`远程编辑功能。

如果是单独针对某台服务器，则在对应的主机配置段落添加，例如

	Host test4
	    HostName 192.168.1.4
	    User root
		LocalForward 52698 localhost:52698

# 参考

* [textmate/rmate](https://github.com/textmate/rmate/)