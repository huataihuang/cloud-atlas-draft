在使用Sphinx时，发现一个比较麻烦的事情，当文件比较大的情况下（也可能最近我升级到macOS 10.15 beta导致vim缓慢），导致加载文件非常缓慢时，当加载超过一定时间尚未完成，则自动禁止了语法高亮：

```
'redrawtime' exceeded, syntax highlighting disabled
```

参考 [Fix syntax highlighting](https://vim.fandom.com/wiki/Fix_syntax_highlighting) 介绍:

语法高亮对于特定文件类型（例如，Python程序）提供语法高亮以显示关键字、注释或其他组件。当编辑时，Vim会丢失语法跟踪以及出现语法高亮错误。 `:syntax sync` 指令可以控制Vim同步语法高亮状态，这样极具可以覆盖部分文本。但是这个设置的不利条件是导致显示缓慢，因为Vim不断扫描缓存。通常syntax文件（例如， `$VIMRUNTIME/syntax/python.vim` )使用了 `:syntax sync` 来指定同步语法高亮。


# 解决语法高亮无法处理大文件

当前在vim 8中，对大型文件语法高亮会引发redraw超时( [#syntax highlighting breaks for big file after jump or search #2790](https://github.com/vim/vim/issues/2790) )，需要增加redraw时间，即编辑 `.vimrc` 文件:

```
set redrawtime=10000
```

**诱发原因**

经过对比，发现导致 `redraw` (重绘) 屏幕（也就是刷新屏幕） 超时的原因是因为 `.rst` 文件的 `Auchor` (锚点) 字符串过长导致的，例如 `.. _deploy_multi_boot_ubuntu_from_tarball_manually:` 会导致vim打开文件缓慢并超时(粘贴也是如此，因为引擎需要分析缓存中字符串)，而 `.. _deploy:` 则毫无阻碍。感觉应该是语法高亮引擎拖慢了vim。

----

# **其他**

## 从文件开始进行高亮

对于更为精确但是非常缓慢的结果，可以对 `fromstart` 设置语法同步方式。这可以通过 `vimrc` 完成自动命令:

```
autocmd BufEnter * :syntax sync fromstart
```

## 反向高亮

Vim支持从当前位置反向对可识别语法状态通过搜索变量来支持高亮。例如，对于C语言，可以查看 `$VIMRUNTIME/syntax/c.vim` :

```
if exists("c_minlines")
  let b:c_minlines = c_minlines
else
  if !exists("c_no_if0")
    let b:c_minlines = 50 " #if 0 constructs can be long
  else
    let b:c_minlines = 15 " mostly for () constructs
  endif
endif
exec "syn sync ccomment cComment minlines=" . b:c_minlines
```

这里 `c_minlines` 是Vim反向查找最小行数以发现语法高亮的起点。如果行数超过起点范围，语法高亮则可能不正确。可以在 `vimrc` 中调整这个设置:

```
let c_minlines=500
```

> 更大的值可以提高精度，但是导致语法高亮缓慢。

相比较 `formstart` 语法高亮，也可能可以通过以下设置提高精度但是速度更快:

```
syntax sync minlines=200
```

# 参考

* [Fix syntax highlighting](https://vim.fandom.com/wiki/Fix_syntax_highlighting)