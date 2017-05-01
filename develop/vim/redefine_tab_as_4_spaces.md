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

# 参考

* [Redefine tab as 4 spaces](http://stackoverflow.com/questions/1878974/redefine-tab-as-4-spaces)