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

```bash
#!/bin/bash
file="/home/vivek/data.txt"
while IFS= read -r line
do
        # display $line or do somthing with $line
	printf '%s\n' "$line"
done <"$file"
```

* 如果要按照列来读取

```bash
#!/bin/bash
file="/etc/passwd"
while IFS=: read -r f1 f2 f3 f4 f5 f6 f7
do
        # display fields using f1, f2,..,f7
        printf 'Username: %s, Shell: %s, Home Dir: %s\n' "$f1" "$f7" "$f6"
done <"$file"
```

# 读取文件行到数组

```bash
declare -a myarray
let i=0
while IFS=$'\n' read -r line_data; do
    # Parse “${line_data}” to produce content 
    # that will be stored in the array.
    # (Assume content is stored in a variable 
    # named 'array_element'.)
    # ...
    myarray[i]="${array_element}" # Populate array.
    ((++i))
done < pathname_of_file_to_read
```

最高效的（也是最简单的）方法是将文件的所以行使用bash内建命令`readarray`读入到一个数组：

```bash
declare -a myarray
readarray myarray < file_pathname # Include newline.
readarray -t myarray < file_pathname # Exclude newline.
```

举例：

```bash
#!/bin/bash
declare -a myarray

# Load file into array.
readarray myarray < ~/.bashrc

# Explicitly report array content.
let i=0
while (( ${#myarray[@]} > i )); do
    printf "${myarray[i++]}\n"
done
```

# 参考

* [Linux/UNIX: Bash Read a File Line By Line](https://www.cyberciti.biz/faq/unix-howto-read-line-by-line-from-file/)
* [How to read all lines of a file into a bash array](https://peniwize.wordpress.com/2011/04/09/how-to-read-all-lines-of-a-file-into-a-bash-array/)