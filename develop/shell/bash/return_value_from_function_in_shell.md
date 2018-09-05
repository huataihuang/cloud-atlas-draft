在bash函数中，可以通过以下三种方式返回字符串：

* 在函数中 `echo <string>` （推荐使用这种方法，比较清晰）
* 返回一个退出状态，这是一个数值，而不是字符串
* 共享变量

# echo 字符串

在函数中 `echo <string>` 可以返回指定字符串，这样就可以在主程序中来判断字符串是否符合某个条件：

```
lockdir="somedir"
testlock(){
    retval=""
    if mkdir "$lockdir"
    then # directory did not exist, but was created successfully
         echo >&2 "successfully acquired lock: $lockdir"
         retval="true"
    else
         echo >&2 "cannot acquire lock, giving up on $lockdir"
         retval="false"
    fi
    echo "$retval"
}

retval=$( testlock )
if [ "$retval" == "true" ]
then
     echo "directory not created"
else
     echo "directory already created"
fi 
```

# 返回退出值

```
lockdir="somedir"
testlock(){
    if mkdir "$lockdir"
    then # directory did not exist, but was created successfully
         echo >&2 "successfully acquired lock: $lockdir"
         retval=0
    else
         echo >&2 "cannot acquire lock, giving up on $lockdir"
         retval=1
    fi
    return "$retval"
}

testlock
retval=$?
if [ "$retval" == 0 ]
then
     echo "directory not created"
else
     echo "directory already created"
fi 
```

# 共享变量

```
lockdir="somedir"
retval=-1
testlock(){
    if mkdir "$lockdir"
    then # directory did not exist, but was created successfully
         echo >&2 "successfully acquired lock: $lockdir"
         retval=0
    else
         echo >&2 "cannot acquire lock, giving up on $lockdir"
         retval=1
    fi
}

testlock
if [ "$retval" == 0 ]
then
     echo "directory not created"
else
     echo "directory already created"
fi 
```

# 我的经验

我通常会采用函数中使用local变量，然后调用函数返回值

* 计算公式：

```bash
function do_fun() {
    local val1=$1
    local val2=$2
    result=$(($val1 + $val2))
    echo $result
}

cal_result=$( do_fun 3 9 )
echo $cal_result
```

* 随机返回文本文件中某行内容（假设系统中没有`shuf`工具）：

```bash
VM_LIST=vm_list

furnction get_random_vm() {
local vm=''
local vm_num=`wc -l $VM_LIST | awk '{print $1}'`
vm_line_num=$(($RANDOM % $vm_num + 1))
vm=`tail -$vm_line_num $VM_LIST | head -n 1`
echo $vm
}

vm=$(get_random_vm)
```

# 函数返回多个值

* 常规shell

```bash
#!/bin/ksh
calc()
{
  A=$1
  B=$2
  total=$(( A + B ))
  diff=$(( A - B ))
  echo "$total $diff"
}
RES=$( calc  5 8 )
TOT=$( echo $RES | cut -f 1 )
DIF=$( echo $RES | cut -f 2 )
echo $TOT
echo $DIF
```

* 如果是bash则获取返回值更为方便：

```bash
#!/bin/bash
calc()
{
  A=$1
  B=$2
  total=$(( A + B ))
  diff=$(( A - B ))
  echo "$total $diff"
}
read TOT DIF < <(calc 5 8)
echo $TOT
echo $DIF
```

# 参考

* [returning value from called function in shell script](https://stackoverflow.com/questions/8742783/returning-value-from-called-function-in-shell-script)
* [Returning and capturing multiple return values from a function](https://www.unix.com/shell-programming-and-scripting/220621-returning-capturing-multiple-return-values-function.html)