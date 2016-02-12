因为[准备nodejs开发环境](nodejs_develop_environment.md)，准备从头开始，所以想要卸载掉原先通过`pkg`安装的node.js，然后重新通过`nvm`来管理node.js版本。

对于实用官方pkg安装包，使用如下命令卸载

	lsbom -f -l -s -pf /var/db/receipts/org.nodejs.pkg.bom \
	| while read i; do
	  sudo rm /usr/local/${i}
	done
	sudo rm -rf /usr/local/lib/node \
	     /usr/local/lib/node_modules \
	     /var/db/receipts/org.nodejs.*

# 参考

* [在Mac OS X下安装和卸载Node.js的方法](http://www.micmiu.com/lang/nodejs/mac-osx-nodejs-install/) － 非常完善的总结方法
* [How do I uninstall nodejs installed from pkg (Mac OS X)?](http://stackoverflow.com/questions/9044788/how-do-i-uninstall-nodejs-installed-from-pkg-mac-os-x) - stackoverflow上的卸载方法，准确实用