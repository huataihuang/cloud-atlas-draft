[在android上安装了debina linux](deploy_linux_on_android.md)之后，Nexus 5手机就成为了一个移动的Linux工作站，随时可以通过ssh登录到Linux中，并且借助Debian海量的开源软件，构建自己移动的开发工作环境。

> 实际我的构想是，随身携带iPad Por平板（加键盘），通过ssh登录到自己随身的Android中的Linux系统中，实现一个web开发环境，以及进行一些开发学习工作。
>
> 相对iOS封闭环境（没有越狱的iOS环境限制了其作为移动工作站的可能），随身的Linux（on Android）提供了无限的可能，用来构建Web开发环境，脚本编写，c/python/ruby等各种语言开发环境。

# 安装基础开发环境

> 参考 [Debian最小化安装后的软件包安装建议](../../../os/linux/debian/package/debian_mini_install_packages_suggest.md)

```bash
apt-get install tmux wget bzip2 sysstat unzip ssh \
mlocate dnsutils git gcc g++ make sudo curl flex autoconf automake python ruby
```

# 安装gitbook

* 安装nodejs

> 我的主要[技术文档撰写平台是Gitbook](../../doc/gitbook/using_gitbook_write_book.md)

```bash

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
nvm ls-remote
nvm install 4.4.0
npm install -g gitbook-cli

git clone https://github.com/huataihuang/cloud-atlas.git

npm install gitbook-plugin-disqus
npm install gitbook-plugin-codeblock-filename -g

cd cloud-atlas
gitbook serve
```

> 使用[nvm](../../nodejs/startup/nodejs_develop_environment.md)来设置开发环境

# iPad Pro设置

iPad Pro具备了外接键盘，输入效率尚可（相比较屏幕输入而言），通过一定的软件配置组合，可以实现一个小型的开发环境。例如作为Python或Ruby开发环境，我尝试开发Flask和Rails程序，结合浏览器实现一个小型web开发环境。

> 无须额外费用，只需要一个平板电脑和一台手机。

> 其实，我最近观察到[Google推出了Pixel C平板电脑](http://pad.zol.com.cn/565/5653326.html)，由于原生的Linux支持，并且能够root，实际上作为开发者使用更为合适，完全是二合一的产品，甚至都不需要外部的Linux环境。售价更是iPad Pro的一半（屏幕略小，做工略差些，不过键盘看起来超越了iPad Pro）！

# 连接和访问

iPad Pro通过4G和互联网连接，可以通过无线和蓝牙共享网络连接给Nexus5手机使用。

iPad Pro支持蓝牙4.2，Nexus 5支持蓝牙4.0，从技术角度来说，蓝牙较为省电。所以通常我使用蓝牙共享连接方式，来连接两者。并且使用蓝牙直接连接两个设备，IP地址分配可以保持一致，方便网络连接配置。

## 远程访问Nexus 5

iOS平台有一些比较好的ssh客户端，以及远程做开发的程序开发编辑器。推荐使用[Coda](https://panic.com/coda-ios/)，因为不仅支持远程文件编辑，而且内嵌了ssh客户端，这样就可以远程访问服务器，编辑和调试程序。开发Coda的Panic公司还有单独用于ssh的客户端Prompt。不过，我觉得购买了Coda之后就拥有了Prompt绝大多数功能，且提语言开发功能，更适合程序员使用。












