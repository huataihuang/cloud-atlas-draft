Python通过subprocess可以执行外部命令，是结合shell和操作系统中工具的方法。

# 变量传递

如果需要传递变量给subprocess需要执行的指令，嗯可以通过先将变量传递给一个指令行，这样就可以结合指令行来运行subprocess:

```python
# 从 myapp.log 取最后10行到 current_myapp.log

myapp_log_line = 10
myapp_log_file = /var/log/myapp.log
current_time = (datetime.datetime.now() - datetime.timedelta(minutes=1)).strftime("%Y-%m-%d %H:%M")
recent_myapp_log_file = /var/log/current_myapp.log

mdisk_log_output_cmd = "tail -%s %s | grep '%s' | tee %s " % (myapp_log_line, myapp_log_file, current_time, recent_myapp_log_file)
myapp_log_output = subprocess.check_output(myapp_log_output_cmd, shell=True).splitlines()
```