在shell中经常需要判断字符串是否包含在另一个字符串中，以下是搜集的一些shell处理方法：

* 利用grep查找

```bash
strA="long string"
strB="string"
result=$(echo $strA | grep "${strB}")
if [[ "$result" != "" ]]
then
    echo "包含"
else
    echo "不包含"
fi
```

`grep` 查找要搜索的字符串，用变量`result`记录结果。如果结果不为空，说明strA包含strB。如果结果为空，说明不包含。

* 利用字符串运算符 (这个方法最简洁)

```bash
strA="helloworld"
strB="low"
if [[ $strA =~ $strB ]]
then
    echo "包含"
else
    echo "不包含"
fi
```

字符串运算符 `=~` 直接判断strA是否包含strB，要求bash版本3.x（不过，现在主流操作系统都满足要求）。

* 利用通配符

```bash
A="helloworld"
B="low"
if [[ $A == *$B* ]]
then
    echo "包含"
else
    echo "不包含"
fi
```

* 利用case in 语句

```bash
thisString="1 2 3 4 5" # 源字符串
searchString="1 2" # 搜索字符串
case $thisString in 
    *"$searchString"*) echo Enemy Spot ;;
    *) echo nope ;;
esa
```

* 利用替换

```bash
STRING_A=$1
STRING_B=$2
if [[ ${STRING_A/${STRING_B}//} == $STRING_A ]]
    then
        ## is not substring.
        echo N
        return 0
    else
        ## is substring.
        echo Y
        return 1
fi
```

# 参考

* [Shell判断字符串包含关系的几种方法](http://blog.csdn.net/iamlihongwei/article/details/59484029)