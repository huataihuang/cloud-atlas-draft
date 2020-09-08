我希望执行一个shell命令，如果执行成功（返回`0`）就执行一个动作，使用`if then`的方法尝试如下：

```bash
if [ `lsmod | grep example_mod` && `cat /etc/example_mod.conf | grep example_mod_version=XYZ` ]; then touch /tmp/example_mod; fi
```

> 目的是判断是否有内核模块以及从配置文件中查询是否有对应XYZ的版本，如果有则touch一个开关文件方便后续处理。

但是发现报错

```bash
-bash: [: missing `]'
```

这个报错参考 [How to conditionally do something if a command succeeded or failed](http://unix.stackexchange.com/questions/22726/how-to-conditionally-do-something-if-a-command-succeeded-or-failed) ，原来执行命令返回结果作为条件判断是不需要加 `[]` 的，`[`就是表示`test`指令（另外半边`]`只是为了配对，不用也可以）。

也就是说，如果你是判断一个文件或这目录是否存在，实际上就是隐含使用了 `test` 指令去检查文件是否存在，此时就需要使用 `[` ，例如：

```bash
if [ -d /etc/kubernetes ] && [ -f /usr/sbin/kubelet ]; then
    echo "system has installed kubelet"
else
    echo "system without kubelt"
fi
```

但是，如果你是检查命令执行是否成功，则不要加 `[`，例如:

```bash
if kubelet info ; then
    echo "kubelet exceed success"
else
    else 
```

另外常用的方式

```bash
rm -rf somedir || exit_on_error "Failed to remove the directory"
```

这样执行命令出错就会有提示信息

正确的命令是

```bash
if (lsmod | grep example_mod && cat /etc/example_mod.conf | grep example_mod_version=XYZ); then touch /tmp/example_mod; fi
```

> 这里`if`条件中不使用`()`也可以，加上是看上去清晰一些。

# 参考

* [How to conditionally do something if a command succeeded or failed](https://unix.stackexchange.com/questions/22726/how-to-conditionally-do-something-if-a-command-succeeded-or-failed)