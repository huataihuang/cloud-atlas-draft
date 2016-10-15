# shell的数组

* 构建数组

```
array=(bill chen bai hu)
```

* 直接读取一行文本来构建array

```
array=(`tail -1 example.txt`)
```

这里假设文本是 `bill chen bai hu`

* 获取数组的长度

```
num=${#array[@]}
```

输出结果`4` (共4个单词)

* 获取数组某个单元的长度

```
len=${#array[3]}
```

输出结果`2`，即第4个单词是2个字符（注意，数组的下标从0开始）

* 输出数组的某个单元

```
echo ${array[0]}
```

输出内容 `bill`