# NR,FNR,NF定义

* `NR`：表示从`awk`开始执行后，按照记录分隔符读取的数据次数，默认的记录分隔符为换行符，所以默认就是读取的数据行数。`NR`可以理解为Number of Record的缩写。

* `FNR`：当awk处理多个输入文件的时候，在处理完第一个文件，NR并不是从1开始，而是继续累加，所以就出现了`FNR`，每当处理一个新文件的时候，FNR就从1开始计数，所以FNR可以理解为File Number of Record。

* `NF`：表示目前记录被分割的字段的数量，NF可以理解为Number of Field。

## 案例

下面以示例程序来进行说明，首先准备两个输入文件class1和class2，记录了两个班级的成绩信息，内容分别如下所示：

```bash
CodingAnts@ubuntu:~/awk$ cat class1
zhaoyun 85 87
guanyu 87 88
liubei 90 86
CodingAnts@ubuntu:~/awk$ cat class2
caocao 92 87 90
guojia 99 96 92
```

查看两个班级的所有成绩信息，并在每条信息前加上行号，则可以使用下面的awk指令；

```bash
CodingAnts@ubuntu:~/awk$ awk '{print NR,$0}' class1 class2
1 zhaoyun 85 87
2 guanyu 87 88
3 liubei 90 86
4 caocao 92 87 90
5 guojia 99 96 92
```

如果要求每个班级的行号从头开始变化，则需要使用FNR来实现，如下：

```bash
CodingAnts@ubuntu:~/awk$ awk '{print FNR,$0}' class1 class2
1 zhaoyun 85 87
2 guanyu 87 88
3 liubei 90 86
1 caocao 92 87 90
2 guojia 99 96 92
```

下面的示例结合awk内建变量FILENAME，显示出来的两个班级的成绩信息可以进行更好的区分

```bash
CodingAnts@ubuntu:~/awk$ awk '{print FILENAME,"NR="NR,"FNR="FNR,"$"NF"="$NF}' class1 class2
class1 NR=1 FNR=1 $3=87
class1 NR=2 FNR=2 $3=88
class1 NR=3 FNR=3 $3=86
class2 NR=4 FNR=1 $4=90
class2 NR=5 FNR=2 $4=92
```



# 参考

* [awk内建变量示例详解之NR、FNR、NF](http://www.letuknowit.com/topics/20120329/sample-about-awk-build-in-variable-nr-fnr-nf.html/)
* [<译>8个有力的Awk内建变量](http://shomy.top/2016/05/05/trans-8-powerful-awk-built-in-variables/)