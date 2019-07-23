> 我使用macOS内建的vim版本（当前最新macOS 10.15已经采用了8.1.1312)

[macOS Setup Guide](https://sourabhbajaj.com/mac-setup/) 的 [vim](https://sourabhbajaj.com/mac-setup/Vim/) 章节介绍了两种vim配置：

- [The Ultimate vimrc](https://github.com/amix/vimrc) 集成了大量插件和精心的配置，并且适合多种平台的vim
- [Maximum Awesome](https://github.com/square/maximum-awesome) 面向mac平台的vim配置，集成了MacVim, iTerm2, tmux等工具

# The Ultimate vimrc

[The Ultimate vimrc](https://github.com/amix/vimrc) 是一个vim配置集成，有2个版本：

- The Basic: 仅仅需要将 [basic.vim](https://github.com/amix/vimrc/blob/master/vimrcs/basic.vim) 复制成 `~/.vimrc` 就能够具备基本的良好配置

- The Awesome: 包含大量有用的插件，以及配置。推荐使用

# 安装Awesome版本

## 只作为个人使用

如果只作为个人单用户使用，只需要执行以下命令:

```
git clone --depth=1 https://github.com/amix/vimrc.git ~/.vim_runtime
sh ~/.vim_runtime/install_awesome_vimrc.sh
```

## 多用户安装

多用户安装，仓库需要复制到可以给所有潜在用户访问的位置

```
git clone --depth=1 https://github.com/amix/vimrc.git /opt/vim_runtime
sh ~/.vim_runtime/install_awesome_parameterized.sh /opt/vim_runtime user0 user1 user2
# to install for all users with home directories
sh ~/.vim_runtime/install_awesome_parameterized.sh /opt/vim_runtime --all
```

## 字体

推荐使用 [IBM Plex Mono font](https://github.com/IBM/plex) 开源的适合编程的字体。并且Awesome vimrc已经设置并尝试使用它。注意，github上提供了两种格式字体，OpenType和TrueType，两者对于最终用户区别不大（ [OTF vs. TTF Fonts: Which Is Better? What’s the Difference?](https://www.makeuseof.com/tag/otf-vs-ttf-fonts-one-better/) /  [OTF vs TTF? What's the difference?](https://356labs.com/blog/otf-vs-ttf-whats-the-difference/) )，不过OpenType是Adobe和微软于1990s推出的支持更多字符的字体(TrueType是Apple和微软于1980s推出的字体)，并且跨平台使用，或许可以选择OpenType。

安装方法可以参考 [How to Install, Remove, and Manage Fonts on Windows, Mac, and Linux](https://www.howtogeek.com/192980/how-to-install-remove-and-manage-fonts-on-windows-mac-and-linux/) ，在 macOS上，只要打开 Font Book，然后将解压缩的字体目录拖放进去就可以安装好了。

请参考 [Install IBM Plex Font](https://blog.programster.org/install-IBM-plex-font) 在Ubuntu上安装。

其他可以用于Awesome的字体：

- [Hack](http://sourcefoundry.org/hack/)
- [Source Code Pro](https://adobe-fonts.github.io/source-code-pro/)

# 安装基本版本

 仅仅需要将 [basic.vim](https://github.com/amix/vimrc/blob/master/vimrcs/basic.vim) 复制成 `~/.vimrc` ，适合远程服务器并且不需要安装很多插件

```
git clone --depth=1 https://github.com/amix/vimrc.git ~/.vim_runtime
sh ~/.vim_runtime/install_basic_vimrc.sh
```

# 更新最新版本

```
cd ~/.vim_runtime
git pull --rebase
```

# 使用

## 按键映射

[leader](http://learnvimscriptthehardway.stevelosh.com/chapters/06.html#leader) 是 `,` ，很多功能都是通过 `<leader>` 来实现。例如，启用文件导航 [NERD Tree](https://github.com/scrooloose/nerdtree)

```
map <leader>nn :NERDTreeToggle<cr>
map <leader>nb :NERDTreeFromBookmark 
map <leader>nf :NERDTreeFind<cr>
```

## TAB

```
map <leader>tn :tabnew<cr>
map <leader>to :tabonly<cr>
map <leader>tc :tabclose<cr>
map <leader>tm :tabmove 

" Opens a new tab with the current buffer's path
" Super useful when editing files in the same directory
map <leader>te :tabedit <c-r>=expand("%:p:h")<cr>/
```

## 窗口切换

在不同窗口间切换

```
map <C-j> <C-W>j
map <C-k> <C-W>k
map <C-h> <C-W>h
map <C-l> <C-W>l
```

# 参考

* [macOS Setup Guide](https://sourabhbajaj.com/mac-setup/) 的 [vim](https://sourabhbajaj.com/mac-setup/Vim/) 章节