在shell中将时间转换成1970年开始的秒，则可以进行计算，`date -d +%s`可以输出当前时间的UNIX秒。

```
CURTIME=`date +"%Y-%m-%d %H:%M:%S"` #当前的系统时间 2009-05-04 14:34:00
LASTLINE=$(ls -lt * "$v_DIRNAME"| line | awk '{print $6,$7,$8}')    #获取文件的最后时间 2009-10-04 14:30:00 
echo "lasttime "$LASTLINE  
echo "Systime "$CURTIME
Sys_data=`date -d  "$CURTIME" +%s`    #把当前时间转化为Linux时间
In_data=`date -d  "$LASTLINE" +%s`
interval=`expr $Sys_data - $In_data`  #计算2个时间的差
echo $In_data
echo $Sys_data
echo $interval
```

时间差计算可以使用上述 `expr $Sys_data - $In_data` ，也可以使用单括号运算符`$()`：

```
interval=$($Sys_data - $In_data)
```

# 参考

* [SHELL中计算时间差方法](http://blog.csdn.net/foxliucong/article/details/4225008)
* [linux shell 时间运算以及时间差计算方法](http://www.cnblogs.com/chengmo/archive/2010/07/13/1776473.html)