# 基本配置

建立三个目录：

```bash
mkdir ～/.vim/{plugin,doc,syntax} –p
```

建立配置文件：

```bash
touch ~/.vimrc
```

# 跳转到函数、变量定义处

* `[+ctrl+i` 跳转到函数、变量
* `[+ctrl+d` 跳转到#define处
* `ctrl+o` 返回

# 括号跳转

小括号的跳转：跳到句子的下头，句子以句号或者空行结束，英文中的句号为 “.”。

* `(`          (左小括号) 移到这个句子的开头
* `)`          (左小括号) 移到下一个句子的开头

中括号的跳转：跳到函数的开头或者结尾

* `[[`         跳往上一个函式的起始大括号
* `]]`         跳往下一个函式的起始大括号
* `[]`         跳往上一个函数的起始大括号
* `][`         跳往下一个函数的结束大括号

大括号的跳转：跳到段落的开头，段落以空行划分

* `{`         (左大括号) 跳到上一段的开头
* `}`         (右大括号) 跳到下一段的的开头

# `.vimrc`案例

```
"基本配置  
set wildmenu  
"增强模式中的命令行自动完成操作  
set foldmethod=manual  
"设定折叠方式为手动  
set helplang=cn  
"设置帮助的语言为中文  
set cin      
"实现C程序的缩进  
set sw=4     
"设计(自动) 缩进使用4个空格  
set sta      
"插入时使用'shiftwidth'  
set backspace=2  
"指明在插入模式下可以使用删除光标前面的字符  
syntax enable  
"设置高亮关键字显示  
set nocompatible  
"去掉讨厌的有关vi一致性模式，避免以前版本的一些bug和局限  
set number  
"显示行号  
filetype on  
"检测文件的类型  
map :q  
set history=1000  
""记录历史的行数  
set background=dark  
"背景使用黑色  
syntax on  
"语法高亮度显示  
set autoindent  
set smartindent  
"上面两行在进行编写代码时，在格式对起上很有用；  
"第一行，vim使用自动对起，也就是把当前行的对起格式应用到下一行；  
"第二行，依据上面的对起格式，智能的选择对起方式，对于类似C语言编写上很有用  
"第一行设置tab键为4个空格，第二行设置当行之间交错时使用4个空格  
set tabstop=4  
set shiftwidth=4  
set showmatch  
"设置匹配模式，类似当输入一个左括号时会匹配相应的那个右括号  
set ruler  
"在编辑过程中，在右下角显示光标位置的状态行  
set incsearch  
"查询时非常方便，如要查找book单词，当输入到/b时，会自动找到第一  
"个b开头的单词，当输入到/bo时，会自动找到第一个bo开头的单词，依  
"次类推，进行查找时，使用此设置会快速找到答案，当你找要匹配的单词  
"时，别忘记回车。  
 set enc=chinese   
"设置编码为中文  
set winaltkeys=no  
"Alt组合键不映射到菜单上
```

# 参考

* [vim 跳转到函数、变量定义处](https://blog.csdn.net/tycoon1988/article/details/38929953)