# 简单案例

```java
public class FirstSample {
    public static void main(String[] args) {
        System.out.println("We will not use 'Hello, World!'");
    }
}
```

* 每个程序都是一个类，你看main主程序的外面也包了一个类名 `FirstSample` ，java的main方法必须有外壳类
* 主程序名字是 `main` ，主程序有一个字符串列表参数 `args`
* 主程序有固定的修饰符 `public` 表示对外公开，并且是静态 `static`，而且有关键字`void`表示方法没有返回值
    * main方法正常退出则退出码是0
    * 如果需要终止程序是返回其他代码，需要使用 `System.exit` 方法
* Java的名词都使用驼峰命名方式，例如 `FirstSample` , `System` ，需要记住这个规律，由多个名字组成成的长名词。 - 注意：类名是驼峰命名的
* Java的动词(方法)采用小写，例如 `println` ，注意 `out.println` 中的 `out` 是 对象，完整的对象是 `System.out`，执行调用的愈发就是 **`对象.方法(参数)`** ，这里的案例就是 `System.out.println("XXXX")`

源代码的名字必须和类名完全一致，也就是说，上述 `FirstSample` 的文件名保存为 `FirstSample.java`

语句必须以`;`分号结束，如果没有分号，则语句可以延续多行。

# 变量

声明一个变量以后，必须用赋值语句对变量进行 **显式初始化** ，千万不能使用没有初始化对变量。

变量声明剋放在代码的任何一个地方，但是编程习惯是尽可能靠近变量第一次使用的地方。

```java
double salary = 6000.0;
System.out.println(salary);
```

# 常量

常量关键字 `final` ，表示这个变量只能被赋值一次。 **习惯上，常量名使用全答谢**

类常量：指常量在一个类的多个方法中使用，关键字是 `static final`

类常量定义位于main方法的外部（类的内部），这样同一个类的其他方法也就可以使用这个常量。

如果类常量被声明为 `public` 则其他类的方法也就可以使用这个常量。

# 自增和自减运算符

和 C++ 一样：

* `n++` 先计算然后再递增1
* `++n` 先递增然后再计算

建议不要在表达式中使用自增和自减符号，这样容易引起bug

# 关系运算符

* 检测相等性 `==`
* 逻辑与 `&&`
* 逻辑或 `||`

三元操作符 `? :` :

```java
condition ? expression1 : expression2;
```

举例：

```java
x < y ? x : y;
```

```java
Int A,B,C; 
A=2; 
B=3; 
C=A>B ? 100 :200; 
```

# 位运算

* 位模式左移或右移 `>>` 和 `<<`

# 子串

String类的`substring`方法可以从一个较大的字符串中提取出一个子串:

```java
String greeting = "Hello";
String s = greeting.substring(0,3);
```

注意：字符串位置起始是0，这 `substring` 的第二个参数是不想截取的位数，及终止在3之前，所以这里的实际返回字符串位就是 `0,1,2` ，也就是 `Hel`

# 拼接+

通常多个字符串连接在一起可以使用 `+` 符号

如果要把多个字符串连接并使用一个界定符分隔，则使用静态`join`方法:

```java
String all = String.join("/", "S", "M", "L", "XL");
// 则得到的字符串就是 "S/M/L/XL"
```

# 不可变字符串

Java的String类没有提供修改字符串的方法，如果需要修改字符串变量，则采用先通过 `substring` 提取出需要的字符，然后拼接上替换的字符串。

例如要修改 `greeting` 字符串，将 `Hello` 修改成 `Help!`

```java
String greeting = "Hello";
greeting = greeting.substring(0,3) + "p!";
```

之所以Java没有像C一样提供直接修改字符串变量的原因，是因为java对于复制字符串变量是采用共享相同的字符，类似于C语言的 `char*` 指针。

类似C的实现：

```c
char* temp = malloc(6);
strncpy(temp, greeting, 3);
strncpy(temp + 3, "p!", 3);
greeting = temp;
```