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

# 在array每个元素添加字符串

参考 [How to append a string to each element of a Bash array?](https://stackoverflow.com/questions/6426142/how-to-append-a-string-to-each-element-of-a-bash-array)

```
function gen_vm_rss()
{
    time_stamp=`date +%Y-%m-%d" "%H:%M:%S`
    vm_rss_array=( $(ps aux | grep qemu | grep -v grep | awk '{print $13"|"$6}') )
    vm_num=${#vm_rss_array[@]}
    for ((i=0;i<vm_num;i++));do
        vm_rss_array[i]="$time_stamp|${vm_rss_array[i]}"
        echo "${vm_rss_array[i]}"
    done
}
```