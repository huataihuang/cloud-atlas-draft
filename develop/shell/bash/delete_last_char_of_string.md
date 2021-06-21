在shell编程中，经常需要移除字符串最后一些字符，在bash中，有一个非常方便的方法：

```bash
#!/bin/bash

v="some string.rtf"
v2=${v::-4}
echo "$v --> $v2"
```

不过，这个方法对bash版本有一定要求，需要 bash 4+

更为通用的方法结合使用 `rev` 和 `cut` ，原理是先通过 `rev` 反转字符串，然后通过 `cut` 将反转后的字符串开头n个字符移除，然后再次反转字符串

```bash
echo "hello world" | rev | cut -c5- | rev
```

返回结果就是

```
hello w
```

# 参考

* [Delete the last character of a string using string manipulation in shell script](https://unix.stackexchange.com/questions/144298/delete-the-last-character-of-a-string-using-string-manipulation-in-shell-script)
* [How to remove last n characters from a string in Bash?](https://stackoverflow.com/questions/27658675/how-to-remove-last-n-characters-from-a-string-in-bash)