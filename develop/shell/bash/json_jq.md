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

现在我们可以用shell脚本来处理输出的json数据，但是，如果要依赖组合的 `awk` `grep` `cut` 显然非常繁琐，效率低下。

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




# 参考

* [Working with JSON in bash using `jq`](https://medium.com/cameron-nokes/working-with-json-in-bash-using-jq-13d76d307c4)