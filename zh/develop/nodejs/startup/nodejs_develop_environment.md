> 以下步骤在Mac OS X上完成，Linux环境应该类似

# 安装`nvm`

[nvm](https://github.com/creationix/nvm) 的全称是 Node Version Manager。这个工具可以管理和切换 Node.js 版本，以便测试和开发。 （例如，在使用[hexo](https://hexo.io)作为自己的blog撰写平台，就遇到过部分插件对nodejs版本的兼容性要求）

	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash

> 具体安装命令请参考 [nvm的GitHub网站](https://github.com/creationix/nvm) 以便安装最新版本。如果已经使用[nodejs官网安装包](https://nodejs.org/en/)，可以[先卸载node.js](uinstall_nodejs_in_os_x.md)。

> 上述安装命令在将`nvm`安装在个人目录下`~/.nvm`，并且在`~/.bash_profile`中添加了路径

	export NVM_DIR="/Users/huatai/.nvm"
	[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

安装完成后，执行`nvm`命令可以看到输出，就表示安装成功。

# 安装Node

通过`nvm`可以安装多个版本

	nvm install 5.6.0
	nvm install 4.3.0

安装以后，可以使用已经安装的版本

	nvm use 5.6.0

或者只是运行这个版本

	nvm run 5.6.0 --version

可以在子命令使用指定版本的node

	nvm exec 4.3.0 node --version

也可以找到指定版本的安装位置

	nvm which 5.6.0

如果你已经安装了一个新的Node.js版本，希望从旧版本将npm包迁移过来，可以使用如下命令

	nvm install v5.0 --reinstall-packages-from=4.2
	nvm install v4.2 --reinstall-packages-from=iojs

如果希望使用一个系统范围安装的node，可以使用特殊的默认别名`system`

	nvm use system
	nvm run system --version

如果希望查看已经安装的版本

	nvm ls

如果想查看可以被安装的版本

	nvm ls-remote

要恢复路径，可以关闭

	nvm deactivate

要在shell中使用默认的Node版本，使用别名`default`

	nvm alias default 4.3.0




# 参考

* [搭建 Node.js 开发环境](https://github.com/alsotang/node-lessons/tree/master/lesson0)