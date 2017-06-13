文件内容

```
10605 (example_process) run_count=568 avgrun=13.62ms avgwait=6.43ms
10594 (example_process) run_count=587 avgrun=12.22ms avgwait=3.15ms
10606 (example_process) run_count=513 avgrun=9.16ms avgwait=1.38ms
```

需要找出`10605` 对应行中包含 `run_count=` 的字段

```
tail /tmp/latency.log | grep 10605 | awk '{ for (i=1;i<=NF;i++) { if ($i ~ /run_count=/) print $i } }'
```

> 参考 [how to print the column that contains a string in delimited file in unix](http://www.unix.com/unix-for-dummies-questions-and-answers/181267-how-print-column-contains-string-delimited-file-unix.html)

注意，如果要传递shell的变量，请参考[shell变量传递给AWK](awk_shell_var)方法。