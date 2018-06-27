> 开发环境 Ubuntu 16.04

# ctags+cscope

`ctags`程序通过程序代码生成标签，可以简单将其是为索引。索引用于生成函数、变量、 类成员、宏等的索引，用于管理数据库。利用数据库信息在vim或emacs中查找源代码的函数、变量等数据是，索引可以让搜索变得容易。

ctags 支持的程序包括 C, C++, 汇编等。

* 安装`ctags`

```bash
sudo apt install ctags
```

通过`ctags`生成标签的命令是`ctags -R`。不过，对于下载的linux内核，不仅有ARM结构，还带有x86在内多种结构代码。解决方法是使用内核源码提供的生成各种结构的ctags标签的脚本：

```
cd linux-2.6.24
make tags ARCH=x86_64
```

> 也可以生成arm架构，使用`make tags ARCH=arm`
>
> 此时在当前目录下生成一个`tags`文件

ctags只能进行单方向搜索，无法搜索调用的函数；无法输出调用该函数的函数；无法输出该函数调用的函数。

`cscope`和`ctags`诗风相似，但补充了`ctags`的不足。

```bash
sudo apt install cscope
```

同样，执行以下命令生成

```
make cscope ARCH=x86_64
```

将分析文件等目录保存在`cscope.files`文件之后，就可以用`cscope`

# vim 插件

在 https://www.vim.org 网站搜索 

* Source Explorer插件（`srcexpl.vim`）
* NERD tree插件（``）
* Tag List插件（`taglist.vim`）

创建`~/.vim`目录，然后将下载的插件复制到该目录下

```
mkdir ~/.vim
cp Download/SrcExpl-5.3.zip ~/.vim/
cp Download/NERD_tree.zip ~/.vim/
cp Download/taglist_46.zip ~/.vim/
```

然后进入`~/.vim`目录创建 `plugin` 子目录

```bash
cd ~/.vim
mkdir plugin
unzip SrcExpl-5.3.zip
unzip NERD_tree.zip
unzip taglist_46.zip
```

# 配置vim环境

* 检查`ctags`和`cscope`执行文件位置：

```bash
$ whereis ctags
ctags: /usr/bin/ctags /usr/share/man/man1/ctags.1.gz

$ whereis cscope
cscope: /usr/bin/cscope /usr/share/man/man1/cscope.1.gz
```

* 编辑`~/.vimrc`

```
"---------------------------
"vim environment
"---------------------------
set nu			"line number
set ai			"auto indent
set ts=4		"tab size
set bg=dark		"backgroud color

"---------------------------
" ctags database path
"---------------------------
set tags=/home/huatai/src/linux-2.6.24/tags   "ctags db

"---------------------------
" cscope database path
"---------------------------
set csprg=/usr/bin/cscope		"cscope
set csto=0						"cscope DB search first
set cst							"cscope DB tag DB search
set nocsverb					"verbose off

"---------------------------
" Tag List environment
"---------------------------
filetype on						"vim filetype on
nmap <F7> :TlistToggle<CR>		"F7 key = Tag List Toogling
let Tlist_Ctags_Cmd = "/usr/bin/ctags"  "ctags program
let Tlist_Inc_inwidth = 0		"window width change off
let Tlist_Exit_OnlyWindow = 0	"tag/file finish choice taglist
let Tlist_Auto_Open = 0			"when vim start, window open=off
let Tlist_Use_Right_Window = 1

"---------------------------
" Source Exlorer environment
"---------------------------
nmap <F8> :SrcExplToggle<CR>	"F8 Key = SrcExpl Toogleing
"nmap <C-H> <C-W>h				"move to left window
"nmap <C-J> <C-W>j				"move to down window
"nmap <C-K> <C-W>k				"move to up window
"nmap <C-L> <C-W>l				"move to right window
nnoremap <C-H> <C-W><C-H>
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>

let g:SrcExpl_winHeight = 8 	"set SrcExpl Window high
let g:SrcExpl_refreshTime = 100	"refreshing time = 100ms
let g:SrcExpl_jumpKey = "<ENTER>" "jump to definition
let g:SrcExpl_gobackKey = "<SPACE>" "back
let g:SrcExpl_isUpdateTags = 0 	"tag file update = off

"---------------------------
" NERD Tree environment
"---------------------------
let NERDTreeWinPos = "left"		"NERD Tree at left
nmap <F9> :NERDTreeToggle<CR>	"F9 Key = NERD Tree Toggling
```

然后打开`vim`之后，按下`F7`，`F8`，`F9`可以切换出`Tag List`，`Source Exporer`和`NERD Tree`分割窗口。

使用`ctrl+h/j/k/l`可以在各个窗口间切换。

> 原文中使用了`nmap <C-L> <C-W>l`来映射窗口切换快捷键，但是我在Mac上iTerm2中使用遇到不能切换，反而是将屏幕分割的问题。改成`nnoremap <C-H> <C-W><C-H>`才解决。

# 代码浏览

在光标切换到奥`Tag List`窗口后，通过进入vim的ex模式（按下Esc键），然后在下方窗口输入`:/start_kernel`，就能够移动到`start_kernel`符号，此时按下`Enter`键，代码文件窗口就会显示定义`start_kernel`的位置。

在代码中移动光标放到函数或变量上时，下方的Source Explorer窗口就会显示定义相应符号的位置。例如，光标移动到`start_kernel(void)`函数时，下方的Source Explorer窗口显示的时`start_kernel`符号定义的文件。

移动到下端窗口（`ctrl+j`），选择列表中的1项（`Enter`键），在代码中就会显示该文件。此时，通过不断`ctrl+j`转跳可以不断浏览引用该函数的文件。

如果要回退到当前状态之前的位置，则按下空格键（space bar）就可以回到之前状态。

# ctags

使用`ctrl+]`可以根据当前光标所在的关键字跳转到它的定义处。

当使用这种方法浏览整个代码库时，vim会为访问过的标签维护一个历史列表。使用`ctrl-t`按键就会回退当上一个定义处。再次按下`ctrl-t`就会返回原位。

# cscope

当光标移动到某个符号时，如果Source Explorer窗口显示`Definition Not Found`信息（表示无法查找该符号），则可以通过`cscope`指令得到相关文件列表。

方法是先切换到ex模式，然后输入`:cs find s kthread_create_list`

这里使用cscope提供多种`<querytype>`，使用方法如下：

```
: cs find <querytype> <name>
```

* s 查找C符号
* g 查找定义（definition）
* d 查找被该函数调用的(called)函数
* c 查找调用该函数的（calling）函数
* t 查找文本字符串（text string）
* e 查找egrep犯事
* f 查找文件
* i 查找用#include包含该文件的文件

如果想获得cscope的帮助，可以在vim中转换为ex模式，然后通过`:help cscope`查看详细信息

# 参考

* 《ARM Linux内核源码剖析》