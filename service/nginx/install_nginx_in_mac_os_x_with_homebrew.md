# 安装

使用`brew`安装`nginx`

    brew install nginx

安装后可以看到提示

	Docroot is: /usr/local/var/www

	The default port has been set in /usr/local/etc/nginx/nginx.conf to 8080 so that
	nginx can run without sudo.

	nginx will load all files in /usr/local/etc/nginx/servers/.

	To have launchd start nginx at login:
	  ln -sfv /usr/local/opt/nginx/*.plist ~/Library/LaunchAgents
	Then to load nginx now:
	  launchctl load ~/Library/LaunchAgents/homebrew.mxcl.nginx.plist
	Or, if you don't want/need launchctl, you can just run:
	  nginx

启动

	nginx

> 将文件复制到`/usr/local/var/www`可提供文件web访问下载


# 参考

* [Install Nginx, PHP-FPM, MySQL and phpMyAdmin on OS X Mavericks or Yosemite](http://blog.frd.mn/install-nginx-php-fpm-mysql-and-phpmyadmin-on-os-x-mavericks-using-homebrew/)
* [Installing Nginx in Mac OS X Mountain Lion With Homebrew]()