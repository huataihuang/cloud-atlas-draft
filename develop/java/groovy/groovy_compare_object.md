> 本文摘自 [groovy中对象的比较以及非空判断](https://blog.csdn.net/chenwill3/article/details/23615509) 原文比较简洁实用，记录备用。

# 字符串是否包含在数组中

结合 `in` 和 `for` 循环可以很容易判断字符串是否包含在数组中:

```groovy
def arr=["上海", "南京", "福州"]
for(item in arr){
    println itme
}
```

> 我在写shell脚本中也经常使用类似方式:

```bash
for i in `ls ~`;do
    wc -l $i
done
```

# groovy对象表

groovy可以比较字符串、map结合、list结合

* 字符串比较

```groovy
def str1="Hello World1"
if("Hello World"==str1){
    println "Hello World"
} else {
    println "不匹配"
}
```

* map集合的比较

```groovy
def m1=["name":"李明", "age":20]
def m2=["name":"李明", "age":21]
if(m1==m2){
    println "m1和m2匹配"
} else {
    printlsn "m1和m2不匹配"
}
```

* 如果要比较两个对象的引用是否相同，可以使用 `is` :

```groovy
println m1.is(m3)
```

# 判断对象是否为空

groovy中判断对象是否为空，可以直接使用 `if(对象){}` :

```groovy
def m5=["name":"Lucy"]
//判断map集合是否为空（字符串或list都可以这么判断）
if (m5) {
    println "m5不为空"
}
```

另外，Groovy提供了 `isEmpty()` 方法来判断列表是否包含元素，如果空则返回true

```groovy
class Example { 
   static void main(String[] args) { 
      def lst = [11, 12, 13, 14]; 
      def emptylst = [];
		
      println(lst.isEmpty()); 
      println(emptylst.isEmpty()); 
   } 
}
```

# 组合的案例

```groovy
package org.lxh
public class UseRange{
 
	public static void main(def args){
        //定义一个range
		def range=1..15
		println range.contains(10);
		println range.from;
		println range.to;
        //使用range输出7天的日期
        def today = new Date()
        def nextWeek = today + 7
        (today..nextWeek).each{
            println it
        }
        //in的用法------(重要)
        def arr=["上海","南京","福州"]
        for(item in arr){
           println  item
        }
        //groovy对象的比较比较---（重要）
        //1.字符串比较
        def str1="Hello World1"
        if("Hello World"==str1){
            println "Hello World"
        }else{
            println "不匹配"
        }
        //2.map集合的比较（list集合也可以这样比较）----（重要）
        def m1=["name":"李明","age":20]
        def m2=["name":"李明","age":21]
        def m3=["name":"李明","age":21]
        if(m1==m2){
            println "m1和m2匹配"
        }else{
            println "m1和m2不匹配"
        }
        //判断对象的引用是否相同---(重要)
        println m1.is(m3)
        //if判断对象是否为空
        def m5=["name":"Lucy"]
        //判断map集合是否为空（字符串或list都可以这么判断）----（重要）
        if(m5){
           println "m5不为空"
        }
        //更为方便的判断对象是否为空的操作符 ?.-------(重要)
        println "${m5?.name}"
	}
}
```

# 参考

* [groovy中对象的比较以及非空判断](https://blog.csdn.net/chenwill3/article/details/23615509)