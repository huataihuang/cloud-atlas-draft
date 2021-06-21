在bash中，有时候我们需要把一个字符串补全到一定字符长度，例如，员工工号要求6位数字，但是早期员工的工号较短。为了能够统一采用6位数字，我们需要补全字符串。

解决的方法是采用 `printf` 程序，例如

```bash
printf %-10s AABB | tr ' ' X
```

输出就是 `AABBXXXXXX`

```bash
printf %10s AABB | tr ' ' X
```

输出就是`XXXXXXAABB`

# 参考

* [Pad a string to a certain length with a chosen character (or hexcode) in Bash?](https://stackoverflow.com/questions/50604111/pad-a-string-to-a-certain-length-with-a-chosen-character-or-hexcode-in-bash)