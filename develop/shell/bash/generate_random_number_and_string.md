# 随机数字

`bash`提供了一个特殊的`$RANDOM`变量（在`ksh`中也支持），是随机选择`0`到`32767`之间的一个整数。简单的方法就是

```bash
echo $RANDOM
```

另外一种方法是采用`/dev/random`和`/dev/urandom`设备接口通过内核来随机产生数字：

```bash
od -vAn -N4 -tu4 < /dev/urandom
```

或者

```bash
od -An -N2 -i /dev/random
```

> od - dump files in octal and other formats

# 随机字符串

随机字符串的方法是利用了前面生成随机数字的方法结合`md5sum`工具，将随机数字的`md5`计算出来（也就是随机的字符串了）

```bash
echo $RANDOM | md5sum
```

甚至可以再随机一些

```bash
echo $RANDOM | md5sum | md5sum
```

如果要截取指定长度（举例9位）

```bash
echo $RANDOM | md5sum | cut -c 1-9
```

# 参考

* [Bash Shell Generate Random Numbers](http://www.cyberciti.biz/faq/bash-shell-script-generating-random-numbers/)
* [BASH - Generate a Random String](http://utdream.org/post.cfm/bash-generate-a-random-string)