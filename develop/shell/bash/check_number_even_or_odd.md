在shell中检查数字是偶数还是奇数，其实就是取模，查看取模以后的余数是0还是1

```bash
#Bash Script to check whether a number is even or odd
read -p "Enter a number: " number
if [ $((number%2)) -eq 0 ]
then
  echo "Number is even."
else
  echo "Number is odd."
fi
```

这种取模方式也适合hash，也就是均布到指定数量的桶中。

# 参考

* [Bash Shell Script to check whether a number is even or odd](https://www.tutorialsandyou.com/bash-shell-scripting/even-odd-14.html)