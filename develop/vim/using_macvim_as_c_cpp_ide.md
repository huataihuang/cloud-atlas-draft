[YouCompleteMe(YCM)](http://www.alexeyshmalko.com/2014/youcompleteme-ultimate-autocomplete-plugin-for-vim/)是一个快速自动完成代码输入的vim引擎。支持Clang, C/C++/Ojbective-C/Objective-C++，以及C#, Python（Jedi-based completion engine）

# 安装

> 参考[YouCompleteMe README.md#installation](https://github.com/Valloric/YouCompleteMe/blob/master/README.md#installation)

## Mac OS X

* 首先安装最新版本[MacVim](https://github.com/macvim-dev/macvim/releases)

如果不实用MacVim GUI，建议使用MacVim.app包中的Vim程序（`MacVim.app/Contents/MacOS/Vim`）。为确保使用mvim，从[MacVim](https://github.com/macvim-dev/macvim/releases)安装目录复制出`mvim`脚本，复制到`/usr/local/bin/mvim`，然后建立一个软连接：

```
cd /usr/local/bin

ln -s /Applications/MacVim.app/Contents/bin/mvim mvim

ln -s /usr/local/bin/mvim vim
```

* 使用[Vundle](https://github.com/VundleVim/Vundle.vim#about)安装YouCompleteMe

注意：YCM是一个编译组件的插件。如果使用Vundle更新YCM，并且ycm_core苦API修改（很少发生），YCM会提示你重现编译。则需要重新安装。

注意：如果要使用C的自动完成，则需要安装最新的Xcode和最新的Command Line Tools。可以在首次运行`clang`命令或手工运行`xcode-select --install`

```
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
```

编辑`~/.vimrc`，将以下内容设置在开始：

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

安装插件：启动`vim`然后运行`:PluginIntall`

（可选）对于使用fish shell，在`.vimrc`开头加上：

```
set shell=/bin/bash
```

* 安装CMake

这个安装是通过[Homebrew](http://brew.sh/)，不过也可以[单独安装CMake](https://cmake.org/download/)

# 参考

* [Vim (or MacVim) as a C/C++ IDE](http://urinieto.com/2014/09/vim-or-macvim-as-a-c-ide/)
* [YouCompleteMe — Ultimate Autocomplete Plugin for Vim](http://www.alexeyshmalko.com/2014/youcompleteme-ultimate-autocomplete-plugin-for-vim/)
* [YouCompleteMe: a code-completion engine for Vim](https://github.com/Valloric/YouCompleteMe/blob/master/README.md#installation)