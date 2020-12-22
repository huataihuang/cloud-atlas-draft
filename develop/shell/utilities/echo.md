echo命令有一些比较常用的方法：

# 用echo将执行命令结果返回

```bash
echo $(cat file.txt)
```

这种方式特别适合执行 grep 命令结果进行一层层过滤，然后和另外一个echo过滤命令拼接起来返回结果

举例：我有2个文件，分别是

* `num_app.txt`

```
数量 应用名
```

* `app_model`

```
应用名 规格
```

我需要将两个文件拼接起来，以应用名为关联:

```bash
cat num_app.txt | awk '{print $2}' > num_app.txt

for i in `cat app_list`; do
    echo -n $(grep "^$i " app_model.txt | head -1)| \
      sed 's/ /,/g'
    echo -n ","
    echo $(grep " $i$" num_app.txt | awk '{print $1}')
done > app_model_num.txt
```


# 参考

* [Can I use ECHO to execute commands?](https://stackoverflow.com/questions/17674137/can-i-use-echo-to-execute-commands)
