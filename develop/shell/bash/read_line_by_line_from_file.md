shell中一行行读取文件非常简单

```
while read -r line; do COMMAND; done < input.file
```

> 这里`-r`参数是为了避免反斜线`\`

更为完善且清晰的脚本

```
#!/bin/bash
input="/path/to/txt/file"
while IFS= read -r var
do
  echo "$var"
done < "$input"
```

* 案例

```
#!/bin/bash
file="/home/vivek/data.txt"
while IFS= read -r line
do
        # display $line or do somthing with $line
	printf '%s\n' "$line"
done <"$file"
```

* 如果要按照列来读取

```
#!/bin/bash
file="/etc/passwd"
while IFS=: read -r f1 f2 f3 f4 f5 f6 f7
do
        # display fields using f1, f2,..,f7
        printf 'Username: %s, Shell: %s, Home Dir: %s\n' "$f1" "$f7" "$f6"
done <"$file"
```

# 参考

* [Linux/UNIX: Bash Read a File Line By Line](https://www.cyberciti.biz/faq/unix-howto-read-line-by-line-from-file/)