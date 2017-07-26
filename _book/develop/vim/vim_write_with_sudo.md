经常在编辑系统配置文件时忘记使用`sudo`，编辑完成准备保存时才发现，此时放弃修改为时已晚。解决的方法是采用类似`sudo`方法：

```
:w !sudo tee > /dev/null %
```

为什么要使用上述指令呢？

在 [How does the vim “write with sudo” trick work?](https://stackoverflow.com/questions/2600783/how-does-the-vim-write-with-sudo-trick-work) 提供了一个非常好的解析：

* `%` 在vim中表示"当前文件名"，所以我们在搜索替换时，会使用 `%s:/foo/bar`。
* `:w`并不是表示修改文件，例如，打开`file1.txt`，然后运行`:w file2.txt`，则会不修改`file1.txt`，而是将缓存发送到`file2.txt`。
* 作为替代`file2.txt`，我们可以使用一个`shell`命令来接收缓存中的内容，例如`:w !cat`则会显示内容
* `tee`命令是一个`T`型管道符，也就是可以将输出同时定向到两个地方，所以这里还添加了一个`> /dev/null`避免屏幕输出内容

可以设置一个快捷命令，即在`.vimrc`中添加：

```
" Allow saving of files as sudo when I forgot to start vim using sudo.
cmap w!! w !sudo tee > /dev/null %
```