在维护系统中，经常会遇到需要处理一些程序的json格式配置文件，并且在curl脚本处理RESTful返回数据。

如果输出内容没有很好格式化，则大量的json字符串非常不利于检查。此时，使用python模块 `json.tool` 过滤就可以输出标准格式json内容：

```
container_id=f4810fec374a096895c90e1c74574a7d69e5ec306ea8fe0817e461c28b3da716
cat /var/run/docker/libcontainerd/${container_id}/config.json | python -m json.tool
```

输出内容是非常清晰的json格式:

```
{
    "annotations": {
        "__BlkBufferWriteBps": "0",
        "__BlkBufferWriteSwitch": "0",
        ...
```

有一个处理脚本案例结合了python json.tool和sed等:

```bash
curl -s 'http://api.icndb.com/jokes/random' \
| python -m json.tool \
| grep '\"joke\"' \
| cut -d ':' -f 2 \
| sed 's/&quot;/\"/g'
```

虽然我们可以用shell脚本来处理输出的json数据，但是，如果要依赖组合的 `awk` `grep` `cut` 显然非常繁琐，效率低下。

实际上工具 [jq](https://stedolan.github.io/jq/) 可以帮助我们在shell脚本中处理json数据，特别适合解析一些REST返回数据。

举例

```
curl -s "http://api.icndb.com/jokes/random" | jq '.value.joke'
```

举例，json数据如下

```json
{ "foo": 123, "bar": 456 }
```

我们要提取 foo 键的数据，则使用命令

```bash
echo '{ "foo": 123, "bar": 456 }' | jq '.foo'
```

输出结果就是 `123`

```bash
echo '{ "Version Number": "1.2.3" }' | jq '."Version Number"'
```

# jq处理array

* jq 可以处理数组，使用 `.[]` 方法:

```bash
echo '[1,2,3]' | jq '.[]'
```

对于数组的对象，采用如下方法:

```bash
echo '[ {"id": 1}, {"id": 2}  ]' | jq '.[].id'
```

也可以用来获取 `key/value` 对的值:

```bash
echo '{ "a": 1, "b": 2  }' | jq '.[]'
```

可以按照索引来获得array的值：

```bash
echo '["foo", "bar"]' | jq '.[1]'
```

jq还包含了一些内建功能：

- 返回array的key:

```
echo '{ "a": 1, "b": 2  }' | jq 'keys | .[]'
```

则返回值是a和b。请注意，在jq中也可以使用管道`|`，这里就是表示提取出keys以后在通过索引`.[]`把所有key都输出出来。

- 可以返回array的长度

```bash
echo '[1,2,3]' | jq 'length'
```

# 使用jq创建对象

可以对json进行提取重整，例如:

```bash
echo '{"user": {"id": 1, "name": "Cameron"}}' | jq '{ name: .user.name  }'
```

则输出就是

```json
{
  "name": "Cameron"
}
```

# 去除引号

默认jq输出的结果有双引号，这时候我们存储到字符串变量中会多出这对引号，虽然可以通过 `tr` 命令剥离，但是太麻烦了。实际上， `jq` 就有这个内置功能，参数 `-r` 会移除引号:

```bash
jq -r '.name' <json.txt
```

# 多字段提取方法

```json
{
    "users": [
        {
            "first": "Stevie",
            "last": "Wonder"
        },
        {
            "first": "Michael",
            "last": "Jackson"
        }
    ]
}
```

如果需要一次提出多个字段，可以使用以下方法

```bash
jq '.users[] | .first + " " + .last'
```

输出是：

```
Stevie Wonder
Michael Jackson
```

这个方法非常优秀，我用它来处理一些非常复杂的嵌套json效率极高

类似也可以采用，输出效果相同

```bash
jq '.users[] | "\(.first) \(.last)"'
```

另外一种多字段输出会换行：

```bash
jq '.users[] | ".first , .last'
```

# json字符串错误`INvalid string`

我在使用脚本生成的json文件，发现 `jq` 解析报错

```bash
parse error: Invalid string: control characters from U+0000 through U+001F must be escaped at line 264, column 1
```

在vs code中观察，可以看到报错提示: `Unexpected end of string.json(258)`

原因是我想在 "text" 中传递大段的markdown文本，但是很不幸，json规范不支持真正的行回车，只能通过 `\n` 来打断行。 - 参考 [Unexpected end of string.json(258)](https://stackoverflow.com/questions/2392766/are-multi-line-strings-allowed-in-json) 可以看到:

> structure your data: break the multiline string into an array of strings, and then join them later on.

所以要将

```json
{
    "text" : "line 1
    line 2
    line 3
    "
}
```

修订为:

```json
{
    "text" : "line 1\nline 2\nline 3"
}
```


# 参考

* [Working with JSON in bash using `jq`](https://medium.com/cameron-nokes/working-with-json-in-bash-using-jq-13d76d307c4)
* [Working with JSON in bash using jq](https://cameronnokes.com/blog/working-with-json-in-bash-using-jq/)
* [How to remove double-quotes in jq output for parsing json files in bash? ](https://stackoverflow.com/questions/44656515/how-to-remove-double-quotes-in-jq-output-for-parsing-json-files-in-bash)
* [Using jq to parse and display multiple fields in a json serially](https://stackoverflow.com/questions/28164849/using-jq-to-parse-and-display-multiple-fields-in-a-json-serially)