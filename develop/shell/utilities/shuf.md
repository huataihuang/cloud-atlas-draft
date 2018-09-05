在shell中如果要随机显示文本文件中的某行（或某些行），有一个非常好的工具shuf，这个工具是GNU coreutils工具集中的一个实用软件。

```bash
shuf -n 1 filename
```

> `-n`是输出多少行
>
> RHEL 6才带了这个实用工具，RHEL 5需要下载源代码编译

另一种方法是使用

```bash
sort -R input | head -n 100 >output
```

不过，`sort`产生的随机行可能重复

# 随机打印文档的每行

例如，我需要随机读取主机列表文件中的主机名，以便随机顺序来处理所有主机：

```bash
VM_LIST=vm_list
VM_LIST_R=vm_list_random

vm_num=`wc -l $VM_LIST | awk '{print $1}'`
shuf -n $vm_num $VM_LIST > $VM_LIST_R

for vm in `cat $VM_LIST_R`;do
    ssh $vm "hostname;uptime"
done
```

# 参考

* [How to display a random line from a text file?](http://askubuntu.com/questions/525599/how-to-display-a-random-line-from-a-text-file)
* [How to randomly sample a subset of a file](http://unix.stackexchange.com/questions/108581/how-to-randomly-sample-a-subset-of-a-file)