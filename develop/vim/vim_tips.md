

* 编辑`/tmp/why is vim so greate.mm`文件

```bash
:e /tmp/why\ is\ vim\ so\ greate.mm
```

* 另存为`/tmp/what_is_it.txt`

```bash
:saveas /tmp/what_is_it.txt
```

* 语法高亮为`.xml`文件语法 - 对于文件格式有很好的

```bash
:set ft=xml
```

* 设置自动缩进

```bash
:set autoindent
:set cindent
```

> 按下`> G`会缩进当前行到文档末尾，在编程中非常有用

* 设置自动缩进2个空格

```bash
:set shiftwidth=2
```

* 设置语法高亮

vim会根据文件扩展名来判断文件类型，并启用对应的语法高亮。不过，有时候文件扩展名可能和内容类型不同，例如，在脚本公共部分使用了命名`common.inc`，则vim不会自动使用shell的语法高亮。临时解决方法是执行：

```
:set syn=sh
```

或者

```
:set filetype=sh
```

> 参考[How to highlight Bash scripts in Vim?](http://stackoverflow.com/questions/2576687/how-to-highlight-bash-scripts-in-vim)

* 搜索光标当前所在单词（相当于 `/字符串` ，但是是完整匹配） 使用快捷键 `#`

# paste模式切换

在复制粘贴代码到vim时，需要关闭掉自动indent，否则会导致代码缩进混乱。

* 开启paste模式:

```bash
:set paste
```

或者直接输入命令

```bash
:paste
```

* 关闭paste模式:

```bash
:set nopaste
```

* 如果经常切换paste模式，可以在配置`.vimrc`中设置快捷键:

```
set pastetoggle=<F3>
```

# 快速跳跃

快速跳跃到下一个指定字符：`f字符`，例如`f;`就会跳到下一个`;`，`f+`就会跳到下一个`+`

# 大小写切换

* U 将可视模式下选择的字母全部改成大些字母
* u 将可视模式下选择的字母全部改成小写字母
* gUU 当前行字母改成大写
* 3gUU 当当前行开始到下面3航字母改成大写
* guu 当前行字母改成小写
* gUw 光标下的单词改成大写
* guw 光标下的单词改成小写

# `.`是一个微型宏

* 重复上一次指令，按一下`.`

重复不仅可以针对上一次指令，例如`dd`删除行，然后再按一下`.`就会再删除一行。

而且这个指令也包含了插入模式指令`i`：先按一下`i`进入插入模式，然后输入内容，再按下`esc`键退出插入模式。此时所有输入内容都会被记录，所以，此时按下`.`会把刚才输入的所有内容重复输入。这对需要重复输入很多行内容非常有用。

如果在每行行尾添加`;`，通常会用`j$a;`然后再`esc`，但是如果使用`.`，则可以`j$.`来减少3次按键（`a;`然后再`esc`）。

# Ctags 的使用

* 首先在你程序的顶级目录下运行：`ctags -R`，这样会在当前目录下生成tags文件
* 使用快捷键看代码：

```bash
<Ctrl + ]> 调转到变量或函数的定义处

<Ctrl + T> 返回到调用处
```

* 修改程序后, 比如增加了函数定义, 删除了变量定义, tags文件不能自动rebuild, 你必须手动再运行一下命令:`ctgs -R`,还好你不用退出vi

# 参考

* [Auto-indent spaces with C in vim?](http://stackoverflow.com/questions/97694/auto-indent-spaces-with-c-in-vim)
* [Turning off auto indent when pasting text into vim](https://stackoverflow.com/questions/2514445/turning-off-auto-indent-when-pasting-text-into-vim)