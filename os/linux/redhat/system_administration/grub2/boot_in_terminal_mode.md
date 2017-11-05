在[Fedora安装nVidia GT 750M显卡驱动](../../fedora/nvidia_gt_750m)时，如果已经安装过驱动，需要升级驱动模块。则在图形界面中，nVidia安装程序会提示需要切换到终端界面才能卸载旧模块。

Fedora使用了Grub2启动管理器，以下是临时切换到终端启动的方法：

* 在Grub启动菜单按下`e`进入启动参数编辑模式
* 使用上下箭头按键到达`linux`行，在行尾最后添加` 3`
* 然后按下`F10`以新的参数进行启动，就会进入`level 3`也就是字符界面。
* 安装完驱动之后，重启可以恢复原图形界面

# 参考

* [Boot in Terminal Mode](https://ask.fedoraproject.org/en/question/23521/boot-in-terminal-mode/)