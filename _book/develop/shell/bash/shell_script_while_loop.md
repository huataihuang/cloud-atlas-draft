常用while循环：

```bash
while [ condition ]
do
	command1
	command2
	commandN
done
```

举例：

```bash
cnt=0

while [ $cnt -le 5 ];do
    echo "Welcome $cnt times"
    sleep 1
    (( cnt++ ))
    # 也可以使用
    # cnt=$(( $cnt +1 ))
done
```

# 参考

* [Shell Script While Loop Examples](https://www.cyberciti.biz/faq/shell-script-while-loop-examples/)