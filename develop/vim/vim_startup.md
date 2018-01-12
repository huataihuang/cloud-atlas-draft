> 我对vim是又爱又恨，爱是因为其随处可得，任何时候登陆到服务器上，只要掌握基本的前后移动光标方法就可以开始干活；恨是因为过于强大的配置选项，要得到可用的IDE，需要一遍一遍摸索，浪费了太多的时间在一些和开发无关的繁琐事情上。

为了能够节约生命，本文给出一个快速起步的设置方法，基于：

* [vim-plug: Vim plugin manager](https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim)
* [枫上雾棋提供的.vimrc配置](https://github.com/FengShangWuQi/to-vim/blob/master/.vimrc)

这里使用的插件管理器是[vim-plug](https://github.com/junegunn/vim-plug)是Junegunn Choi开发的，他还写了一篇[Writing my own Vim plugin manager](https://junegunn.kr/2013/09/writing-my-own-vim-plugin-manager)解释了这个插件是基于[Vundle](https://github.com/VundleVim/Vundle.vim)衍生出来的，做了并行升级的优化以及针对Python/Ruby开发的裁减。

如果你希望做进一步的定制和掌握更为详细的配置方法，可以参考[将Vim打造成Python开发平台](vim_python_ide)，从Vundle开始定制完成一个VIM的开发环境。

# 操作步骤

* 下载 plugin.vim 然后存放到`~/.vim/autoload`目录：

```
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
  https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

* 下载[枫上雾棋提供的.vimrc配置](https://github.com/FengShangWuQi/to-vim/blob/master/.vimrc)存放成`~/.vimrc`

* 打开`vim`执行以下命令安装插件：

```
:PlugInstall
```

* 重新启动vim

# Tips

上述使用的插件以及配置中使用了一些插件，有其对应的vim快捷方式：

* [NERDTree 快捷键](vim_nerdtree)
* [ycmd异常](vim_ycmd_server_shut_down)

# 参考

* [如何让 vim 成为我们的神器](https://segmentfault.com/a/1190000011466454)