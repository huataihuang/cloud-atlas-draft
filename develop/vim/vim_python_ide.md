# 快速起步

> 本段落是快速完成Python Vim IDE设置的步骤，具体解释见本段落后的内容。本段落目标是尽快开始

* 安装[Vundle](https://github.com/gmarik/Vundle.vim)扩展管理器

```
git clone https://github.com/gmarik/Vundle.vim.git ~/.vim/bundle/Vundle.vim
```

* 使用[vimrc realpython](/img/vi/vimrc_realpython)或者直接从[VIM and Python - a Match Made in Heaven](https://realpython.com/blog/python/vim-and-python-a-match-made-in-heaven/)提供的[VIM config](https://github.com/j1z0/vim-config/blob/master/vimrc)保存成`~/.vimrc`

* 执行`vim`命令，然后在命令模式下执行`:PluginInstall`安装插件

在CentOS 7上，系统安装的vim版本是`7.4.160-1`，但是`:PluginInstall`安装时候提示`requires Vim 7.4.1578+`。可以参考 [The Vim repository at GitHub](The Vim repository at GitHub)从源代码编译安装，但是编译需要`requires Vim compiled with Python (2.6+ or 3.3+) support.`：

> 参考 [Report "YouCompleteMe unavailable: requires Vim compiled with Python 2.x support" error #1907](https://github.com/Valloric/YouCompleteMe/issues/1907)

```
yum install python-devel
yum install python34-devel

git clone https://github.com/vim/vim.git
cd src
./configure --enable-pythoninterp=yes --enable-python3interp=yes
make
sudo make install
```

这样安装完最新的vim 8.0之后，再次在vim中执行`:PluginInstall`即可成功。

* `ycm`需要手工编译出库文件

```
cd ~/.vim/bundle/YouCompleteMe
./install.py
```

> 编译`ycm`需要系统中先安装cmake，并且要求编译器支持C++11。这在CentOS7上编译会存在报错

```
CMake Error at CMakeLists.txt:180 (message):
  Your C++ compiler does NOT fully support C++11.
```

解决的方法参考 [Your C++ compiler does NOT support C++11. #2596](https://github.com/Valloric/YouCompleteMe/issues/2596)，即先安装最新版本的gcc 5.2

```
tar xzvf gcc-5.2.0.tar.gz
cd gcc-5.2.0
./contrib/download_prerequisites
cd ..
mkdir objdir
cd objdir
$PWD/../gcc-5.2.0/configure --prefix=$HOME/gcc-5.2.0 --enable-languages=c,c++,fortran,go
make
make install
```

然后使用如下方法编译YCM

```
CXX=~/gcc-5.2.0/bin/c++ ./install.py
```



> `macOS`需要先安装[cmake](https://cmake.org/install/)才能编译，如果通过`.dmg`包安装二进制软件包，则需要编辑`~/.bash_profile`添加`export PATH=/Applications/CMake.app/Contents/bin:$PATH`，并执行`. ~/.bash_profile`使环境生效后才能执行上述编译。
>
> `YouCompleteMe`模块要求`Vim 7.3.598+`以上版本，Mac OS X 10.11自带的vim版本较低，测试使用`brew`安装的`vim`版本会导致python线程crash，所以不推荐。在macOS 10.12 beta版本上测试验证正常。

----

# vim环境检查

检查 `vim` 版本

    vim --version

> `vim` 版本要求> 7.3，并且支持Python（可以看到上述输出有`+python`）

验证方法是在`vim`中运行命令`:python import sys; print(sys.version)`

可以看到输出

    2.7.10 (default, Oct 23 2015, 18:05:06)
    [GCC 4.2.1 Compatible Apple LLVM 7.0.0 (clang-700.0.59.5)]

# vim扩展

首先需要一个好的扩展管理器

> vim的扩展称为bundles或者plugins

## Vundle

vim有多种扩展管理器，最推荐的是[Vundle](https://github.com/gmarik/Vundle.vim)，就好像VIM的pip，安装方法如下

    git clone https://github.com/gmarik/Vundle.vim.git ~/.vim/bundle/Vundle.vim

然后在自己的用户目录添加一个文件

    touch ~/.vimrc

然后在这个`.vimrc`文件开头添加

    set nocompatible              " required
    filetype off                  " required
    
    " set the runtime path to include Vundle and initialize
    set rtp+=~/.vim/bundle/Vundle.vim
    call vundle#begin()
    
    " alternatively, pass a path where Vundle should install plugins
    "call vundle#begin('~/some/path/here')
    
    " let Vundle manage Vundle, required
    Plugin 'gmarik/Vundle.vim'
    
    " Add all your plugins here (note older versions of Vundle used Bundle instead of Plugin)
    
    
    " All of your Plugins must be added before the following line
    call vundle#end()            " required
    filetype plugin indent on    " required

然后开启`vim`程序，在命令中输入

    :PluginInstall

可以看到Vundle自动下载安装插件

# 设置IDE

VIM不需要鼠标

## 分割页面

在`vim`中，使用命令 `:sv <filename>` 则垂直分隔页面，而使用`:vs <filename>`则水平分隔页面。

> 可以通过在`.vimrc`文件中设置屏幕的不同分隔区域

    set splitbelow
    set splitright

要在不同的split分区移动而不需要鼠标，则可以在`.vimrc`中添加以下配置

    "split navigations
    nnoremap <C-J> <C-W><C-J>
    nnoremap <C-K> <C-W><C-K>
    nnoremap <C-L> <C-W><C-L>
    nnoremap <C-H> <C-W><C-H>

这样就可以使用以下快捷键来移动

    Ctrl-j move to the split below
    Ctrl-k move to the split above
    Ctrl-l move to the split to the right
    Ctrl-h move to the split to the left

> `nnoremap`是nutshell中将一个键映射到另外一个键，例如上面的案例`nnoremap <C-J> <C-W><C-J>`表示将`<C-J`映射成`<C-W><C-j>`键。

## 缓存

缓存可以理解为最近打开的文件，vim提供了方便访问最近的缓存，只要输入`:b <buffer name or number>`用于切换到一个打开的缓存。可以使用`:ls`来列出所有缓存。

> 在`:ls`输出到最后，vim提示`Hit enter to continue`，你可以代之以`:b <buffer number>`来选择列表中的缓存。

## 代码目录

很多现代的IDE提供一个方便的折叠方式展示方法或者类，你可以在`.vimrc`中添加

    " Enable folding
    set foldmethod=indent
    set foldlevel=99

但是这会是你必须使用`za`来进入目录，可以添加以下配置到`.vimrc`这样空格键就更好使用

    " Enable folding with the spacebar
    nnoremap <space> za

对于初始化命令，使用 `set foldmethod=indent`，创建行缩进的目录，这样可以更为方便。比较好的推荐插件是`SimpylFold`，可以在 `.vimrc` 中添加

    Plugin 'tmhedberg/SimpylFold'

然后再次执行 `:PluginInstall` 就可以安装插件

然后在`.vimrc`中添加

    let g:SimpylFold_docstring_preview=1

# Python缩排

对于Python，缩排是非常重要的，需要满足如下两点来完成缩进

* 缩进符合PEP8标准
* 自动处理缩进

在 `.vimrc` 中添加

    au BufNewFile,BufRead *.py
        \ set tabstop=4
        \ set softtabstop=4
        \ set shiftwidth=4
        \ set textwidth=79
        \ set expandtab
        \ set autoindent
        \ set fileformat=unix

然后再添加以下内容

    au BufNewFile,BufRead *.js, *.html, *.css
        \ set tabstop=2
        \ set softtabstop=2
        \ set shiftwidth=2

上述插件称为`ftype`，也就是让你可以针对不同的文件类型区分文件

* 自动缩排

自动缩排对于python不是总适用，所以我们为了解决这个问题，使用 `indentpython.vim`扩展

    Plugin 'vim-scripts/indentpython.vim'

并且我们要避免不需要的空格，素以添加

    au BufRead,BufNewFile *.py,*.pyw,*.c,*.h match BadWhitespace /\s\+$/

* UTF8支持

在`.vimrc`中添加

    set encoding=utf-8

* 自动完成

一个非常好的自动完成插件 `Valloric/YouCompleteMe`，也就是添加

    Bundle 'Valloric/YouCompleteMe'

不过，需要一些C库来避免插件自身的问题，文档介绍[installation instructions](https://github.com/Valloric/YouCompleteMe#mac-os-x-super-quick-installation)

    let g:ycm_autoclose_preview_window_after_completion=1
    map <leader>g  :YcmCompleter GoToDefinitionElseDeclaration<CR>

此外，如果提示错误：

    ycm_client_support.[so|pyd|dll] and ycm_core.[so|pyd|dll] not detected; you need to compile YCM before using it. Read the docs!

这个报错是正常的，因为ycm需要手工编译出库文件

    cd ~/.vim/bundle/YouCompleteMe
	./install.py --clang-completer

# 支持Virtualenv

    "python with virtualenv support
    py << EOF
    import os
    import sys
    if 'VIRTUAL_ENV' in os.environ:
      project_base_dir = os.environ['VIRTUAL_ENV']
      activate_this = os.path.join(project_base_dir, 'bin/activate_this.py')
      execfile(activate_this, dict(__file__=activate_this))
    EOF

上述配置可以检查运行是否在virtualenv，并切换

# 语法检查和高亮

使用`syntastic`扩展

    Plugin 'scrooloose/syntastic'

添加PEP8检查

    Plugin 'nvie/vim-flake8'

然后再添加代码较好查看的方法

    let python_highlight_all=1
    syntax on

# 颜色

使用solarized用于GUI，以及Zenburn用于终端模式

    Plugin 'jnurmine/Zenburn'
    Plugin 'altercation/vim-colors-solarized'

以及检查环境来设置VIM模式

    if has('gui_running')
      set background=dark
      colorscheme solarized
    else
      colorscheme zenburn
    endif

Solarized携带了两种theme，一种是dark，一种是light，切换非常方便，使用`F5`

    call togglebg#map("<F5>")

# 文件浏览

    Plugin 'scrooloose/nerdtree'

如果希望使用tabs，使用`vim-nerdtree-tabs`

如果需要隐藏`.pyc`文件，使用

#  超级搜索

    Plugin 'kien/ctrlp.vim'

只要按下`Ctrl-P`就可以搜索

# 设置行号

    set nu

# 集成Git

    Plugin 'tpope/vim-fugitive'

# Powerline

    Plugin 'Lokaltog/powerline', {'rtp': 'powerline/bindings/vim/'}

# 系统剪贴板

    set clipboard=unnamed

# 在shell中使用vim

要激活，则在`~/.inputrc`添加

    set editing-mode vi

一份完整清单[vimrc realpython](/img/vi/vimrc_realpython)

# 参考

* [VIM and Python - a Match Made in Heaven](https://realpython.com/blog/python/vim-and-python-a-match-made-in-heaven/)
* [vim安装YouCompleteMe 插件](http://www.cnblogs.com/junnyfeng/p/3633697.html)