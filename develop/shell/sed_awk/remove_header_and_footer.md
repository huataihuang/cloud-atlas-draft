需要移除文件的头尾行，最简单的方法是使用 `sed` 行编辑命令：

- `1d` 删除第一行; `2d` 删除第二行；依次类推
- `$d` 删除最后一行

举例:

```bash
#To remove the first record in the original file
sed -i '1d' FF_EMP.txt

#To create a new file with header removed
sed '1d' FF_EMP.txt > FF_EMP_NEW.txt 
```

```bash
#To remove the last record in the original file
sed -i '$d' FF_EMP.txt


#To create a new file with trailer removed
sed '$d' FF_EMP.txt > FF_EMP_NEW.txt 
```

- 可以同时结合起来删除头尾行

```bash
#To remove the header & footer
sed -i '1d;$d' FF_EMP.txt


#To create a new file with header & trailer removed
sed '1d;$d' FF_EMP.txt > FF_EMP_NEW.txt 
```

# 参考

* [How to remove header and footer records of a flat file using UNIX shell script?](https://exploreinformatica.com/how-to-remove-header-and-footer-records-of-a-flat-file-using-unix-shell-script/)