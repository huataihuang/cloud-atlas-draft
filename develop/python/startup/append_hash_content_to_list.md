# append实际是添加了对象引用

python脚本计算处理器延迟

```
def get_cpu_frequency_msg():
    cpu_frequency_data_output = []
    cpu_frequency_data = {}
    cpu_frequency_msg = []
    cpu_frequency_data_output = subprocess.check_output("sudo cpupower monitor -m Mperf | grep -Ev 'Mperf|CPU' | awk -F\| '{print $3\" \"$6}'", shell=True).splitlines()
    for items in cpu_frequency_data_output:
        cpu_frequency_data["name"], cpu_frequency_data["value"] = "cpu"+items.split()[0], int(items.split()[1])
        print cpu_frequency_data
        cpu_frequency_msg.append(cpu_frequency_data)
        print cpu_frequency_msg

    return cpu_frequency_msg
```

上述脚本目的是计算出每个cpu的主频：

```
sudo cpupower monitor -m Mperf | grep -Ev 'Mperf|CPU' | awk -F\| '{print $3" "$6}'
```

命令输出是内容如下

```
   0   2493
  32   2494
   1   2496
  33   2493
  ...
```

将命令输出一行行读取到字典`cpu_frequency_data`，然后将字典值添加到列表`cpu_frequency_msg`，预期输出类似

```

```

但是，没有想到，虽然`print cpu_frequency_data`是正确输出了预想中的命令的每行输出，但是`append`到`cpu_frequency_msg`后，发现下一个值覆盖了上一个值，输出的`cpu_frequency_msg`实际是

```
{'name': 'cpu0', 'value': 2493}
[{'name': 'cpu0', 'value': 2493}]
{'name': 'cpu32', 'value': 2493}
[{'name': 'cpu32', 'value': 2493}, {'name': 'cpu32', 'value': 2493}]
{'name': 'cpu1', 'value': 2493}
[{'name': 'cpu1', 'value': 2493}, {'name': 'cpu1', 'value': 2493}, {'name': 'cpu1', 'value': 2493}]
{'name': 'cpu33', 'value': 2494}
[{'name': 'cpu33', 'value': 2494}, {'name': 'cpu33', 'value': 2494}, {'name': 'cpu33', 'value': 2494}, {'name': 'cpu33', 'value': 2494}]
...
```

可以看到，实际上每次字典`cpu_frequency_data`被`append`到列表`cpu_frequency_msg`都是一个对象引用，所以导致了当`cpu_frequency_msg`内容变化时，列表中所有引用值同时变化。相当于最后输出的就只有最后一行采样值。

# append对象的内容

要将字典内容复制给列表，而不是直接将对象引用加到列表，需要使用`dict()`字典添加：

```
cpu_frequency_msg.append(dict(cpu_frequency_data))
```

> 添加时指定值引用，类似

```
vcpu_5second_perf_data.append(minute_perf_data[vm][time][vcpu][cpu_index])
```

# 修正后脚本

```
def get_cpu_frequency_msg():
    cpu_frequency_data_output = []
    cpu_frequency_data = {}
    cpu_frequency_msg = []
    cpu_frequency_data_output = subprocess.check_output("sudo cpupower monitor -m Mperf | grep -Ev 'Mperf|CPU' | awk -F\| '{print $3\" \"$6}'", shell=True).splitlines()
    for items in cpu_frequency_data_output:
        cpu_frequency_data["name"], cpu_frequency_data["value"] = "cpu"+items.split()[0], int(items.split()[1])
        cpu_frequency_msg.append(dict(cpu_frequency_data))

    return cpu_frequency_msg
```

# 参考

* [Why is my list's .append() changing the value of every member variable to the new variable?](https://stackoverflow.com/questions/11975876/why-is-my-lists-append-changing-the-value-of-every-member-variable-to-the-ne)