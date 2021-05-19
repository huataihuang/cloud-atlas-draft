在程序开发中，设置默认缩进4个空格，并且将`TAB`替换成空格，比较符合常用的编程规范。

`vim`的配置文件`~/.vimrc`添加如下内容

```
set tabstop=4       " The width of a TAB is set to 4.
                    " Still it is a \t. It is just that
                    " Vim will interpret it to be having
                    " a width of 4.

set shiftwidth=4    " Indents will have a width of 4

set softtabstop=4   " Sets the number of columns for a TAB

set expandtab       " Expand TABs to spaces
```

# 显示编辑文件中的TAB

在编辑文档时，文档中包含tab往往无法分辨，在vim中可以定义显示特殊字符的方法：

```bash
set list
set listchars=tab:>-
```

此时，如果文档中有tab符号，则会显示成`>---`，便于检查。

# 空格替换为tab

vim提供了一个 `!retab` 命令来替换空格到 `<tab>` 

```bash
# first in .vimrc set up
:set expandtab
:set tabstop=4
# or you can do this
:set tabstop=4 shiftwidth=4 expandtab

# then in the py file in command mode, run
:retab!
```

你也可以用命令

```bash
sed -e 's/    /\t/g' test.py > test.new.py
```

# tab替换为空格

vim命令如下：

```bash
:set et|retab
```

你也可以用搜索来替换：

```bash
:%s/\t/    /g
```



# 参考

* [Redefine tab as 4 spaces](http://stackoverflow.com/questions/1878974/redefine-tab-as-4-spaces)
* [Displaying tabs as characters](https://vi.stackexchange.com/questions/422/displaying-tabs-as-characters)
* [How to replace tabs with spaces?](https://vi.stackexchange.com/questions/495/how-to-replace-tabs-with-spaces)
* [replace tab by space or replace spaces by tab in linux](https://songhuiming.github.io/pages/2016/07/31/replace-tab-by-space-or-replace-spaces-by-tab-in-linux/)