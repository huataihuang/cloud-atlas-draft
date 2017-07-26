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

# 参考

* [returning value from called function in shell script](https://stackoverflow.com/questions/8742783/returning-value-from-called-function-in-shell-script)