[在android上安装了debina linux](deploy_linux_on_android.md)之后，Nexus 5手机就成为了一个移动的Linux工作站，随时可以通过ssh登录到Linux中，并且借助Debian海量的开源软件，构建自己移动的开发工作环境。

> 实际我的构想是，随身携带iPad Por平板（加键盘），通过ssh登录到自己随身的Android中的Linux系统中，实现一个web开发环境，以及进行一些开发学习工作。
>
> 相对iOS封闭环境（没有越狱的iOS环境限制了其作为移动工作站的可能），随身的Linux（on Android）提供了无限的可能，用来构建Web开发环境，脚本编写，c/python/ruby等各种语言开发环境。

# 安装基础开发环境

> 参考 [Debian最小化安装后的软件包安装建议](../../../os/linux/debian/package/debian_mini_install_packages_suggest.md)

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

