> 我希望在发行版的vim基础上快速完成工作环境设置：线上工作环境，尽可能在通用环境下工作，避免和别人共用环境时无法适应。

> 目前以本文为基础构建(20181018)

# 安装vim

> 在macOS上推荐使用最新版本[MacVim](https://github.com/macvim-dev/macvim/releases)
>
> 在Linux平台可跳过本段操作

如果不实用MacVim GUI，建议使用MacVim.app包中的Vim程序（`MacVim.app/Contents/MacOS/Vim`）。为确保使用mvim，从[MacVim](https://github.com/macvim-dev/macvim/releases)安装目录复制出`mvim`脚本，复制到`/usr/local/bin/mvim`，然后建立一个软连接：

```
if [ ! -d /usr/local/bin ];then sudo mkdir -p /usr/local/bin;fi

cd /usr/local/bin

sudo ln -s /Applications/MacVim.app/Contents/bin/mvim mvim

sudo ln -s /usr/local/bin/mvim vim
```

> 默认 `/usr/local/bin` 路径优先于 `/usr/bin`，所以上述软连接方式可以不修改系统的`/usr/bin/vim`而使用最新安装的`MacVim`

# 基本语法高亮设置

* 编辑`.vimrc`启用基本

```
" exrc禁止vim使用非默认.vimrc的指令
set exrc
set secure

" 设置c语言开发环境
set tabstop=4
set softtabstop=4
set shiftwidth=4
" 设置tab自动转换成空格，适合开发python
set expandtab
" 以上设置tab也可以简化成 set ts=8 et sw=4 sts=4

" 限制行宽
set colorcolumn=120
" 也可以使用 set textwidth=120

" 设置色彩
highlight ColorColumn ctermbg=darkgray
" 使用深色背景可以设置
" set background=dark

" 开启语法高亮功能
syntax enable
" 允许用指定语法高亮配色方案替换默认方案
syntax on

" 重要：设置indent可以实现换行自动缩进，方便python代码整洁
filetype indent plugin on
```

> 以上最基本设置已经可以满足日常文件，如C或者python

# 文件类型检测

默认vim假设所有`.h`文件都属于`C++`文件。如果是纯C开发，并且使用doxygen文档，可以设置以下doxygen语法高亮：

```
augroup project
    autocmd!
    autocmd BufRead,BufNewFile *.h,*.c set filetype=c.doxygen
augroup END
```

# 设置路径变量

vim使用`gf`命令（即在命令状态按下`gf`按键，或者使用`<C-W><C-F>`也可以）来搜索光标下或者光标后字符串作为文件名打开。这个功能在浏览头文件时非常有用。

默认时，vim搜索工作目录下文件。然而，大多数项目都会在独立的目录存储include文件。所以需要设置`vim`的 **`path`** 选项来包含一系列使用逗号分割的目录：

```
let &path.="src/include,/usr/include/AL,"
```

# 插件

* 安装vundle，在操作之前，先准备空的`~/.vim`（备份）

```bash
# rm -rf ~/.vim
mv ~/.vim ~/.vim.bak
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
```



以下内容可选，建议从简单开始，仅使用最基本插件，逐步按需天际

```
" vundle 环境设置
filetype off
set rtp+=~/.vim/bundle/Vundle.vim
" vundle 管理的插件列表必须位于 vundle#begin() 和 vundle#end() 之间
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
" 以下3个插件设置主题风格
Plugin 'altercation/vim-colors-solarized'
Plugin 'tomasr/molokai'
Plugin 'vim-scripts/phd'
" 
Plugin 'Lokaltog/vim-powerline'
Plugin 'octol/vim-cpp-enhanced-highlight'
Plugin 'nathanaelkane/vim-indent-guides'
Plugin 'derekwyatt/vim-fswitch'
Plugin 'kshenoy/vim-signature'
Plugin 'vim-scripts/BOOKMARKS--Mark-and-Highlight-Full-Lines'
Plugin 'majutsushi/tagbar'
Plugin 'vim-scripts/indexer.tar.gz'
Plugin 'vim-scripts/DfrankUtil'
Plugin 'vim-scripts/vimprj'
Plugin 'dyng/ctrlsf.vim'
Plugin 'terryma/vim-multiple-cursors'
Plugin 'scrooloose/nerdcommenter'
Plugin 'vim-scripts/DrawIt'
Plugin 'SirVer/ultisnips'
Plugin 'Valloric/YouCompleteMe'
Plugin 'derekwyatt/vim-protodef'
Plugin 'scrooloose/nerdtree'
Plugin 'fholgado/minibufexpl.vim'
Plugin 'gcmt/wildfire.vim'
Plugin 'sjl/gundo.vim'
Plugin 'Lokaltog/vim-easymotion'
Plugin 'suan/vim-instant-markdown'
Plugin 'lilydjwg/fcitx.vim'
" 插件列表结束
call vundle#end()
filetype plugin indent on
```



# 参考

* [Using Vim as C/C++ IDE](http://www.alexeyshmalko.com/2014/using-vim-as-c-cpp-ide/)
* [Vi Improved](https://wiki.python.org/moin/Vim)