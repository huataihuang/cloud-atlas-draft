`ctags`是一个外部程序，通过扫描代码库，生成关键字索引。Vim对`ctag`的支持，使得我们可以快速地跳到函数及类的定义之处，从而实现浏览整个代码库的目的。

# 安装Exuberant Ctags

在Ubuntu上可以通过`apg-get`安装

    sudo apt-get install exuberant-ctags

Mac OS X可以使用`homebrew`程序帮助安装

    brew install ctags

另外一种方法是手工下载编译安装

> 注意：OS X预装了一套名为`ctags`的BSD软件，所以自己编译安装的`ctags`后需要设置程序路径，确保Exuberant Ctags被首先找到使用

从 [Exuberant Ctags网站](http://ctags.sourceforge.net/)下载

    tar xfz ctags-5.8.tar.gz
    cd ctags-5.8
    ./configure
    make
    sudo make install 

Mozilla基金会资助的[Doctor JS](https://github.com/mozilla/doctorjs)项目提供了`jsctags`，可以实现针对JavaScript代码的静态分析功能（`jsctags`本身就是JavaScript实现的）。使用`jsctags`生成的文件与`ctags`输出的文件格式一致，所以可以做到与Vim无缝对接。

> `jsctags`需要`node.js`和`make`才能运行安装

# 使用ctags创建代码库的索引

可以在系统命令行中调用ctags，以要创建索引的文件路径作为参数，即可以是一个文件，也可以是多个文件。

例如，在代码目录下执行

    ctags *.rb

就可以将当前目录下ruby程序代码分析后生成一个 tags 文件，其中就是对源文件分析而生成的关键字索引。

**使用模式定为关键字，而不是行号** -- `ctags`不采用绝对行号，而是查找命令定位每一处关键字

**使用元数据编辑关键字** -- 在tags索引文件中，使用扩展模式，在末尾添加字段为关键字提供元数据。如`c`表示类，`f`表示函数。

# 配置vim使用ctags

要在Vim中使用基于ctag的转跳命令，首先，要确保标签文件是最新的，其次要让Vim知道到哪里去找标签文件。

在 Vim 中使用以下命令查看缺省配置

    :set tags?

可以看到

    tags=./tags,tags

也就是Vim会在当前文件所在目录和工作目录中查找标签文件。根据上述Vim缺省配置，我们可以在工程的每个子目录都建立一个标签文件，或者简便起见，只在工程的根目录中维护一个全局的标签文件。

# 生成标签文件

可以在Vim中直接调用`ctags`

    :!ctags -R

该命令使得Vim当前工作目录开始，遍历所有子目录，并为每个文件建立索引，最后，再把这个标签文件保存到当前工作目录中。

对于更为复杂的命令，例如加上`--exclude=.git`或者`--languages=-sql`，每次手工输入很麻烦，可以通过以下映射命令

    :nnoremap <f5> :!ctags -R<CR>

这样，就可以只按<F5>键就自动更新索引。

## 在每次保存文件时自动执行ctags

Vim的自动命令（autocommand）功能允许在某个事件发生时调用一个命令，这些事件包括缓冲区的创建、打开或者保存等。以下命令创建一个，每次自动保存时调用ctags:

    :autocmd BufWritePost * call system("ctags -R")

## 通过版本控制软件等回调机制自动执行ctags

大多数版本控制工具都支持回调机制，允许执行一个脚本来响应代码仓库（repository）的事件。可以将源代码控制工具配置成每次提交代码改动时自动为代码仓库更新索引。参考 《Effortless Ctags with Git》

......

# 参考

* [VIM实用技巧](http://www.amazon.cn/Vim实用技巧-英-Drew-Neil/dp/B00VE6RYAI/ref=sr_1_1_twi_kin_2?ie=UTF8&qid=1451224675&sr=8-1&keywords=VIM实用技巧)
* [MAC OSX 安装 ctags](http://blog.163.com/aravarcv@126/blog/static/12384272820135111491143/)