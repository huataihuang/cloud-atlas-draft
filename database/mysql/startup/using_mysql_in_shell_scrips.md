在shell脚本中使用mysql可以避免繁琐的交互查询，快速获得查询结果。

在程序中通常是使用MySQL对应语言的编程接口，例如Perl DBI接口。不过对于简单任务，可以在shell中直接调用mysql，并将结果输出给另外的命令处理。

* 一个简单的查询mysql启动时间的shell

```bash
#!/bin/sh
# mysql_uptime.sh - report server uptime in seconds

mysql --skip-column-names -B -e "SHOW /*!50002 GLOBAL */ STATUS LIKE 'Uptime'"
```

上述脚本也可以将简单的mysql `STATUS;` 命令输出递交给shell处理

```bash
#!/bin/sh
# mysql_uptime2.sh - report server uptime

mysql -e STATUS | grep "^Uptime"
```

在shell中可以使用一种称为`here-document`的方式来实现类似从文件输入的命令：

```bash
command <<MARKER input line 1input line 2input line 3
...
MARKER
```

举例：

```bash
#!/bin/sh
# new_log_entries.sh - count yesterday's log entries

mysql cookbook <<MYSQL_INPUT
SELECT COUNT(*) As 'New log entries:'
FROM log_tbl
WHERE date_added = DATE_SUB(CURDATE(),INTERVAL 1 DAY);
MYSQL_INPUT
```

以下举例计算数据表行数：

```bash
#!/bin/sh
# count_rows.sh - count rows in cookbook database table

# require one argument on the command line
if [ $# -ne 1 ]; then
  echo "Usage: count_rows.sh tbl_name";
  exit 1;
fi

# use argument ($1) in the query string
mysql cookbook <<MYSQL_INPUT
SELECT COUNT(*) AS 'Rows in table:' FROM $1;
MYSQL_INPUT
```

# 字符和编码

对于MySQL中使用了UTF-8编码的字符，则在shell脚本中需要同样设置LANG，否则会导致shell中字符无法正常显示：

```bash
#!/bin/bash
export LANG=en_US.UTF-8

...
```

# 参考

* [Using mysql in Shell Scripts](https://www.oreilly.com/library/view/mysql-cookbook-2nd/059652708X/ch01s30.html)