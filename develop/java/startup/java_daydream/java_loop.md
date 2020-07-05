# for循环

* for循环是固定次数循环
* for循环中控制循环次数的变量应该是同一个变量，这个变量设置初始值、判断条件和每次值增减量
* 不要使用浮点数来作为控制循环的变量，因为浮点数无法精确计算，可能会导致循环永不结束

```java
for (int i = 1; i <=10; i++) {
    System.out.println("Counting ..." + i);
}
```

# while循环

```java
int i = 10;
while (i> 0) {
    System.out.printlin("Counting down ..." + i);
    i--;
}
```

# for each循环

`for each` 循环可以依次处理数组中的每个元素。

foreach循环语句的循环变量将会遍历数组中的每个元素，而不需要使用下标值。