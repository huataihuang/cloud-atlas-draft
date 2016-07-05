# 什么是Here Document

`Here Document` 是在Linux Shell 中的一种特殊的重定向方式，它的基本的形式如下

```bash
cmd << delimiter
  Here Document Content
delimiter
```

它的作用就是将两个 `delimiter` 之间的内容(Here Document Content 部分) 传递给cmd 作为输入参数。比如在终端中输入`cat << EOF` ，系统会提示继续进行输入，输入多行信息再输入EOF，中间输入的信息将会显示在屏幕上。

注意：

* `EOF`只是一个标识而已，可以替换成任意的合法字符
* 作为结尾的delimiter一定要顶格写，前面不能有任何字符
* 作为结尾的delimiter后面也不能有任何的字符（包括空格）
* 作为起始的delimiter前后的空格会被省略掉

Here Document 不仅可以在终端上使用，在shell 文件中也可以使用，例如下面的`here.sh` 文件

```bash
cat << EOF > output.sh
echo "hello"
echo "world"
EOF
```

使用 `sh here.sh` 运行这个脚本文件，会得到`output.sh` 这个新文件，里面的内容如下

```bash
echo "hello"
echo "world"
```

> 上述方法在shell脚本中非常荣实现多行内容输入形成一个新的脚本，这样就可以拆分脚本到多个子脚本进行不同的功能实现

# delimiter 与变量

在Here Document 的内容中，不仅可以包括普通的字符，还可以在里面使用变量。例如上述的`here.sh`脚本改成成

```bash
cat << EOF > output.sh
echo "This is output"
echo $1
EOF
```

然后执行命令 `sh here.sh HereDocument`，运行得到的`output.sh`脚本的内容就是：

```bash
echo "This is output"
echo HereDocument
```

> 这里`$1`被替换成`here.sh`脚本执行的参数内容`HereDocument`

如果不想展开这个变量，则可以在其实的`delimiter`的前后添加`"`来实现，也就是`here.sh`脚本修改成

```bash
cat << "EOF" > output.sh   #注意引号
echo "This is output"
echo $1
EOF
```

此时再次执行 `sh here.sh HereDocument`，运行得到的`output.sh`脚本的内容就是：

```bash
echo "This is output"
echo $1
```

# << 变为 <<-

Here Document 还有一个用法就是将 `<<` 变为 `<<-`。 使用 `<<-` 的唯一变化就是Here Document 的内容部分每行前面的 `tab` (制表符)将会被删除掉，这种用法是为了编写Here Document的时候可以将内容部分进行缩进，方便阅读代码。

# 参考

* [linux shell 的here document 用法 (cat << EOF)](http://my.oschina.net/u/1032146/blog/146941)
* [How does ` cat << EOF` work in bash?](http://stackoverflow.com/questions/2500436/how-does-cat-eof-work-in-bash)