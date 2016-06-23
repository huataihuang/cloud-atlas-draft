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