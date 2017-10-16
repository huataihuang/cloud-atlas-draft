在shell脚本中，可以将函数分开到不同的脚本中，然后通过 `source` 指令或者 `.` 指令组合起来，相当于引用。

> `source`和`.`作用相同，都是只加载引用，但是不会直接执行。

不过，要注意的是，如果要直接执行引用的脚本，则在脚本中直接使用 `sh xxxx.sh` 或者 `./xxxx.sh` 来执行。这种方式会启动一个子进程（subshell），所以其变量值是不能直接在主调脚本中使用，所以除非不交换数据，否则不推荐使用。

参考 [Source命令与./区别](http://metman.info/blog/2014/11/07/sourceming-ling-yu-dot-slash-qu-bie/) 提供了一个很好的案例来解释两种方式的区别：

脚本cmd.sh，其内容如下：

```bash
# cmd.sh
function cmd1()
{
    echo "hello from cmd1"
}
```

照以下几种方式执行，看输出结果的区别。

```bash
$ ./cmd.sh
$ cmd1
cmd1：未找到命令
   
$ bash cmd.sh
$ cmd1
cmd1：未找到命令

$ source cmd.sh
$ cmd1
hello from cmd1
```

> 注意：
>
> * source命令是在当前进程中执行脚本文件中的各个命令，而不是另起 一个子进程（subshell）。 
> * 其它两种方式则是另起一个子进程。

# 参考

* [Source命令与./区别](http://metman.info/blog/2014/11/07/sourceming-ling-yu-dot-slash-qu-bie/)