tail指令提供了获取文件最后几行数据的功能，例如 `tail -10 file` 则显示文件最后10行。

实际上，`tail`加上参数`-c`就可以按照字符来获取最后的数据

```bash
echo "hello" | tail -c 5
ello
```

注意：获取最后4个字符使用的是`-c 5`是因为`echo`指令显示的字符串组后有隐含换行`\n`。如果要避免机上新行（newline character），则使用`echo -n`。

另外，shell支持切片方法：

```bash
someone@mypc:~$ str="A random string*"; echo "$str"
A random string*
someone@mypc:~$ echo "${str:$((${#str}-1)):1}"
*
someone@mypc:~$ echo "${str:$((${#str}-2)):1}"
g
```

其实比较简明的是结合使用`head -c`和`tail -c`，例如要截取`hello`的倒数第四个字符`e`:

```bash
echo -n "hello" | tail -c 4 | head -c 1
```

# 参考

* [How to get the last character of a string in a shell?](https://stackoverflow.com/questions/17542892/how-to-get-the-last-character-of-a-string-in-a-shell)
* [BASH : Get the last 4 characters of output from Standard Out, Inline](https://stackoverflow.com/questions/9219964/bash-get-the-last-4-characters-of-output-from-standard-out-inline)