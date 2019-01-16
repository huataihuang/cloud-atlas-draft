遇到需要从Time Machine中恢复隐藏文件的需求，例如，原先备份中的Home目录下的`.ssh`包含了需要恢复的文件，但是，Time Machine备份的文件，通过文件浏览器是看不到`.ssh`的隐含文件。而直接通过Terminal终端程序访问Time Machine目录，尝试复制文件会被拒绝，提示没有权限。即使切换到root账号也是没有权限的。

以下是能够恢复隐藏文件的方法：

* 启动terminal程序
* 执行以下命令；

```
defaults write com.apple.finder AppleShowAllFiles TRUE
killall Finder
```

上述命令命令告诉finder显示隐藏文件，然后重启finder来显示。

* 此时就可以进入Time Machine复制文件
* 最后执行以下命令再次隐藏`隐藏文件`：

```
defaults write com.apple.finder AppleShowAllFiles FALSE
killall Finder
```

# 参考

* [Mac OS X – Restoring Hidden Files and Folders with Time Machine](https://www.silverbaytech.com/2013/11/21/restoring-hidden-files-with-time-machine/)