再次尝试设置vim的IDE环境，本文参考[所需即所获：像 IDE 一样使用 vim](https://github.com/yangyangwithgnu/use_vim_as_ide)完成实践。

vim主要用于程序代码编写，通过插件和设置能够实现高效的工作模式（需要长期不断的肌肉训练）。

> 本文的设置较为复杂，并且设置了`--enable-gui-gtk2`来支持图形化界面。对于服务器开发实际上往往只能远程ssh的终端界面，所以本文设置我觉得还是偏繁琐，并不完全适合终端使用。
> [JBakamovic/yavide](https://github.com/JBakamovic/yavide) 提供了在图形界面vim实现的现代IDE，方法和本文类似。

# `.vimrc`文件

`.vimrc` 是控制 vim 行为的配置文件，位于 `~/.vimrc`，不论 vim 窗口外观、显示字体，还是操作方式、快捷键、插件属性均可通过编辑该配置文件将 vim 调教成最适合你的编辑器。

很多人之所以觉得 vim 难用，是因为 vim 缺少默认设置，甚至安装完后你连配置文件自身都找不到，不进行任何配置的 vim 的确难看、难用。不论用于代码还是普通文本编辑，有必要将如下基本配置加入 .vimrc 中。

* 前缀键

各类 vim 插件帮助文档中经常出现 `<leader>`，即，前缀键。vim 自带有很多快捷键，再加上各类插件的快捷键，大量快捷键出现在单层空间中难免引起冲突，为缓解该问题，引入了前缀键 `<leader>`。

选一个最方便输入的键作为前缀键，将有助于提高编辑效率。找个无须眼睛查找、无须移动手指的键 —— 分号键，挺方便的，就在你右手小指处：

```
" 定义快捷键的前缀，即<Leader>
let mapleader=";"
```

* 快捷键设定原则

不同快捷键尽量不要有同序的相同字符。比如，`<leader>e` 执行操作 0 和 `<leader>eb` 执行操作 1，在你键入 `<leader>e` 后，vim 不会立即执行操作 0，而是继续等待用户键入 b，即便你只想键入 `<leader>e`，vim 也不得不花时间等待输入以确认是哪个快捷键，显然，这让 `<leader>e` 响应速度变慢。`<leader>ea` 和 `<leader>eb` 就没问题。

* 文件类型侦测

允许基于不同语言加载不同插件（如，C++ 的语法高亮插件与 python 的不同）：

```
" 开启文件类型侦测
filetype on
" 根据侦测到的不同类型加载对应的插件
filetype plugin on
```

* 快捷键

把 vim（非插件）常用操作设定成快捷键，提升效率：

```
" 定义快捷键到行首和行尾
nmap LB 0
nmap LE $
" 设置快捷键将选中文本块复制至系统剪贴板
vnoremap <Leader>y "+y
" 设置快捷键将系统剪贴板内容粘贴至 vim
nmap <Leader>p "+p
" 定义快捷键关闭当前分割窗口
nmap <Leader>q :q<CR>
" 定义快捷键保存当前窗口内容
nmap <Leader>w :w<CR>
" 定义快捷键保存所有窗口内容并退出 vim
nmap <Leader>WQ :wa<CR>:q<CR>
" 不做任何保存，直接退出 vim
nmap <Leader>Q :qa!<CR>
" 依次遍历子窗口
nnoremap nw <C-W><C-W>
" 跳转至右方的窗口
nnoremap <Leader>lw <C-W>l
" 跳转至左方的窗口
nnoremap <Leader>hw <C-W>h
" 跳转至上方的子窗口
nnoremap <Leader>kw <C-W>k
" 跳转至下方的子窗口
nnoremap <Leader>jw <C-W>j
" 定义快捷键在结对符之间跳转
nmap <Leader>M %
```

立即生效。全文频繁变更 .vimrc，要让变更内容生效，一般的做法是先保存 .vimrc 再重启 vim，太繁琐了，增加如下设置，可以实现保存 .vimrc 时自动重启加载它：

```
" 让配置变更立即生效
autocmd BufWritePost $MYVIMRC source $MYVIMRC
```

# `.vim/`目录

`.vim/` 目录是存放所有插件的地方。vim 有一套自己的脚本语言 vimscript，通过这种脚本语言可以实现与 vim 交互，达到功能扩展的目的。一组 vimscript 就是一个 vim 插件，vim 的很多功能都由各式插件实现。此外，vim 还支持 perl、python、lua、ruby 等主流脚本语言编写的插件，前提是 vim 源码编译时增加 `---enable-perlinterp`、`--enable-pythoninterp`、`--enable-luainterp`、`--enable-rubyinterp` 等选项。

vim 插件目前分为 `*.vim` 和 `*.vba` 两类。

前者是传统格式的插件，实际上就是一个文本文件，通常 `someplugin.vim`（插件脚本）与 `someplugin.txt`（插件帮助文件）并存在一个打包文件中，解包后将 `someplugin.vim` 拷贝到 `~/.vim/plugin/` 目录，`someplugin.txt` 拷贝到 `~/.vim/doc/` 目录即可完成安装，重启 vim 后刚安装的插件就已经生效，但帮助文件需执行 `:helptags ~/.vim/doc/` 才能生效，可通过 `:h someplugin` 查看插件帮助信息。传统格式插件需要解包和两次拷贝才能完成安装，相对较繁琐。

` *.vba` 格式插件，安装便捷，只需在 shell 中依次执行如下命令即可：

```
vim someplugin.vba
:so %
:q
```

不论是直接拷贝插件到目录，还是通过 *.vba 安装，都不便于插件卸载、升级，后来又出现了管理插件的插件 vundle。

# 源码安装编辑器 vim

```bash
git clone git@github.com:vim/vim.git
cd vim/
./configure --with-features=huge --enable-pythoninterp --enable-rubyinterp --enable-luainterp --enable-perlinterp --with-python-config-dir=/usr/lib/python2.7/config/ --enable-gui=gtk2 --enable-cscope --prefix=/usr
make
make install
```

* --enable-pythoninterp、--enable-rubyinterp、--enable-perlinterp、--enable-luainterp 等分别表示支持 ruby、python、perl、lua 编写的插件
* --enable-gui=gtk2 表示生成采用 GNOME2 风格的 gvim
* --enable-cscope 支持 cscope
* --with-python-config-dir=/usr/lib/python2.7/config/ 指定 python 路径（先自行安装 python 的头文件 python-devel）

预先安装相关依赖库的头文件，python-devel、python3-devel、ruby-devel、lua-devel、libX11-devel、gtk-devel、gtk2-devel、gtk3-devel、ncurses-devel，如果缺失，源码构建过程虽不会报错，但最终生成的 vim 很可能缺失某些功能。

构建完成后在 vim 中执行

```
:echo has('python')
```

# 插件管理

[vundle](https://github.com/VundleVim/Vundle.vim)会接管 `.vim/` 下的所有原生目录，所以先清空该目录，再通过如下命令安装 vundle：

```
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
```

接下来在 .vimrc 增加相关配置信息：

```
" vundle 环境设置
filetype off
set rtp+=~/.vim/bundle/Vundle.vim
" vundle 管理的插件列表必须位于 vundle#begin() 和 vundle#end() 之间
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
Plugin 'altercation/vim-colors-solarized'
Plugin 'tomasr/molokai'
Plugin 'vim-scripts/phd'
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

vundle 支持源码托管在 https://github.com/ 的插件，同时 vim 官网 http://www.vim.org/ 上的所有插件均在 https://github.com/vim-scripts/ 有镜像，所以，基本上主流插件都可以纳入 vundle 管理。

需要安装插件，先找到其在 `github.com` 的地址，再将配置信息其加入 `.vimrc` 中的`call vundle#begin()` 和 `call vundle#end()` 之间，最后进入 vim 执行

```
:PluginInstall
```



# 参考

* [所需即所获：像 IDE 一样使用 vim](https://github.com/yangyangwithgnu/use_vim_as_ide)