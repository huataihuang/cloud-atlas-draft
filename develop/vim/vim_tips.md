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