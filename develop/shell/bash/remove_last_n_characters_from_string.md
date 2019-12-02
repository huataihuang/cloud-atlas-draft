# 使用bash切片功能

以下脚本可以移除最后4个字符，以此类推:

```bash
#!/bin/bash

v="some string.rtf"

v2=${v::-4}

echo "$v --> $v2"
```

> 上述切片方式获得输出:

```
some string.rtf --> some string
```

bash 3.x也可以采用 `%` 进行切分字符串:

```bash
#!/bin/bash

v="some string.rtf"

v2=${v%????}

echo "$v --> $v2"
```

此外，如果要移除 `.` 及以后所有字符，也可以使用 `${v%.*}` ，效果和上述相同。

# 字符串反转后cut再反转

另外一个移除字符串最后n个字符的思路是：先将字符串反转 `rev` ，然后使用 `cut` 命令切下 `n` 之后字符（参数是 `-c(n+1)-` ），然后再次反转。

以下是切除最后4个字符的方法，注意 `cut` 接受的参数值是5,表示从第五个字符开始切：

```bash
echo "hello world" | rev | cut -c 5- | rev
```

输出则是 `hello w`

# 分隔符和字段

默认分隔符是空格和TAB，可以通过  `-d` 参数指定分隔符，另外，切分可以按照字段来切分，参数是`-f`。举例

```
apiserver-7f685dbc9c-2q6md
apiserver-7f685dbc9c-br74v
apiserver-7f685dbc9c-g9q4h
unified-scheduler-84c99b486-jsm2j
unified-scheduler-84c99b486-mmq7m
unified-scheduler-84c99b486-q6624
```

如果要去除最后2列随机字符串，则使用

```
cat app-name | rev | cut -d'-' -f3- | rev
```

# 参考

* [How to remove last n characters from a string in Bash?](https://stackoverflow.com/questions/27658675/how-to-remove-last-n-characters-from-a-string-in-bash)