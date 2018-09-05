> 要开始Kernel开发学习，在服务器端调试和开发程序，则使用vim作为IDE

* 从 https://github.com/sanjayankur31/vimfiles clone出文件

```
clone https://github.com/sanjayankur31/vimfiles.git
```

* 将目录重命名成 `.vim`

```
mv vimfiles .vim
```

# Vundle管理器

* 安装 [Vundle](https://github.com/VundleVim/Vundle.vim)

```
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
```

* 配置插件，将以下内容设置在`.vimrc`来使用Vundle

```
set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'

" The following are examples of different formats supported.
" Keep Plugin commands between vundle#begin/end.
" plugin on GitHub repo
Plugin 'tpope/vim-fugitive'
" plugin from http://vim-scripts.org/vim/scripts.html
" Plugin 'L9'
" Git plugin not hosted on GitHub
Plugin 'git://git.wincent.com/command-t.git'
" git repos on your local machine (i.e. when working on your own plugin)
Plugin 'file:///home/gmarik/path/to/plugin'
" The sparkup vim script is in a subdirectory of this repo called vim.
" Pass the path to set the runtimepath properly.
Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}
" Install L9 and avoid a Naming conflict if you've already installed a
" different version somewhere else.
" Plugin 'ascenator/L9', {'name': 'newL9'}

" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
"
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
"
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line
```

这里需要修改上述文件 `Plugin 'file:///home/gmarik/path/to/plugin'`，将内容替换为自己构建的plugin的git仓库，例如`Plugin file:///home/huatai/.vim/my_plugin`。但是要确保这个目录确实是真实的且是插件的git目录，否则会报错如下：

```
[2017-04-12 09:37:18] Plugin file:///home/huatai/.vim/my_plugin                                                                         |~
[2017-04-12 09:37:18] $ git clone --recursive 'file:///home/huatai/.vim/my_plugin' '/home/huatai/.vim/bundle/my_plugin'                 |~
[2017-04-12 09:37:18] > Initialized empty Git repository in /home/huatai/.vim/bundle/my_plugin/.git/                                    |~
[2017-04-12 09:37:18] > fatal: '/home/huatai/.vim/my_plugin' does not appear to be a git repository                                     |~
[2017-04-12 09:37:18] > fatal: The remote end hung up unexpectedly                                                                      |~
[2017-04-12 09:37:18] >
```

如果不需要，则注释掉这个目录。

* 安装ctags

```
sudo yum install cscope ctags
```

* 安装插件

执行`vim`命令，然后运行 `:PluginInstall` 安装所有需要插件

也可以使用命令

```
vim +PluginInstall +qall
```

* 可选：在`.vimrc`中添加

```
set shell=/bin/bash
```

> 要获取vundle帮助，使用 `:h vundle`

# 参考

* [Using Vim for C/C++ development efficiently](http://ankursinha.in/blog/2015/06/12/vim-c-plugins.html)
* [JBakamovic/yavide](https://github.com/JBakamovic/yavide) 提供了在图形界面vim实现的现代IDE