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

另外，还有一种比较巧妙的方法：

```bash
# length of maximum padding
padding="......................................"

printf "==== TABLE OF CONTENTS ===========================\n"

# print first line
title="1) Chapter one - the intro"
printf "%s%s %s\n" "$title" "${padding:${#title}}" "Page 1"

# print second line
title="2) Chapter two - summary"
printf "%s%s %s\n" "$title" "${padding:${#title}}" "Page 4"
```

> `${#title}` 是获得 `title` 字符串的长度

输出结果就是

```
==== TABLE OF CONTENTS ===========================
1) Chapter one - the intro............ Page 1
2) Chapter two - summary.............. Page 4
```

# 参考

* [Pad a string to a certain length with a chosen character (or hexcode) in Bash?](https://stackoverflow.com/questions/50604111/pad-a-string-to-a-certain-length-with-a-chosen-character-or-hexcode-in-bash)
* [Bash: using printf to display fixed-width padded string](https://fabianlee.org/2021/06/09/bash-using-printf-to-display-fixed-width-padded-string/)