
这次开发一个分析XEN虚拟化日志文件分析脚本，想构建一个多层嵌套的字典来实现数据结构，主要目的是为了方便后续数据处理，能够通过简单的字典索引来抽取数据进行计算。

原始数据如下

```
2016-11-09 18:06:05 i-642gg331t 0 37.064 0.353 62.503 0.080 5131751952
2016-11-09 18:06:05 i-642gg331t 1 36.490 0.431 63.002 0.077 5131751952
2016-11-09 18:06:05 i-642gg331t 2 42.522 0.432 56.661 0.385 5131751952
2016-11-09 18:06:05 i-642gg331t 3 55.079 0.351 43.491 1.078 5131751952
2016-11-09 18:06:05 i-641c7vsd7 0 34.191 0.730 64.914 0.165 5131751952
2016-11-09 18:06:05 i-641c7vsd7 1 58.079 0.548 41.294 0.079 5131751952
2016-11-09 18:06:05 i-641c7vsd7 2 28.740 0.799 69.563 0.898 5131751952
2016-11-09 18:06:05 i-641c7vsd7 3 33.892 1.298 64.709 0.101 5131751952
2016-11-09 18:06:10 i-642gg331t 0 47.942 0.249 51.711 0.098 5205043312
2016-11-09 18:06:10 i-642gg331t 1 24.982 0.422 74.525 0.071 5205043312
2016-11-09 18:06:10 i-642gg331t 2 23.231 0.442 76.261 0.067 5205043312
2016-11-09 18:06:10 i-642gg331t 3 40.668 0.339 58.921 0.072 5205043312
```

字段解释：

* 第4列是虚拟机的vcpu编号，例如上述虚拟机`i-642gg331t`有4个vcpu
* 第5列是虚拟机vcpu的usage
* 第6列是虚拟机vcpu的steal
* 第7列是虚拟机vcpu的idle

我的想法是构建类似如下的数据结构：

```
{
	"i-642gg331t":
		{
			"2016-11-09 18:06:05":
				{
					"0":[37.064,0.353,62.503,0.080],
					"1":[36.490,0.431,63.002,0.077],
					"2":[42.522,0.432,56.661,0.385],
					"3":[55.079,0.351,43.491,1.078]
				},
			"2016-11-09 18:06:10":
				{
					"0":[47.942,0.249,51.711,0.098],
					"1":[24.982,0.422,74.525,0.071],
					"2":[23.231,0.442,76.261,0.067],
					"3":[40.668,0.339,58.921,0.072]
				},
		},
	"i-642gg331t":
		{
			"2016-11-09 18:06:05":
				{
					"0":[37.064,0.353,62.503,0.080],
					"1":[36.490,0.431,63.002,0.077],
					"2":[42.522,0.432,56.661,0.385],
					"3":[55.079,0.351,43.491,1.078]
				}
		}
}
```

也就是说，我希望构建的是 `字典` 嵌套 `字典` 再嵌套 `字典` 再嵌套 `列表` 的数据结构。

最初根据以往的经验，采用嵌套字典结构 `defaultdict` ，这个结构可以支持字典嵌套字典，也可以支持字典嵌套列表，并且从理论上python对嵌套层数没有限制。

```
from collections import defaultdict

def get_minute_perf_data(perf_data):
    """
    输出当前最近一分钟时间性能
    minute_perf_data 是一个四重嵌套列表的字典:
        字典的索引是虚拟机名字
            字典的索引是采样时间
                字典的索引是vm的vcpu编号
                    列表内容是每个vm的每个采样时间的每个vcpu的性能值（user,steal,idle,offline）
    """
    minute_perf_data = defaultdict(dict)
    vm_time_perf_data = defaultdict(dict)
    time_vcpu_perf_data = defaultdict(list)
    
    with open(perf_data,'r') as f:
        debug_count=0
        for line in f:
            items = line.split()
            vm_name = items[2]
            print "vm_name: %s" % vm_name
            
            time_str = items[1].split(':')[2]
            print "time_str: %s" % time_str
            vcpu_str = items[3]
            print "vcpu_str: %s" % vcpu_str
            
            vcpu_perf_data = []
            for i in range(4,8):
                vcpu_perf_data.append(float(items[i]))
            print "vcpu_perf_data: %s" % vcpu_perf_data
             
            time_vcpu_perf_data[vcpu_str] = vcpu_perf_data
            print "time_vcpu_perf_data: %s" % time_vcpu_perf_data
            
            vm_time_perf_data[time_str] = time_vcpu_perf_data
            print "vm_time_perf_data: %s" % vm_time_perf_data
			
            minute_perf_data[vm_name] = vm_time_perf_data
            print "minute_perf_data: %s" % minute_perf_data
            
            print minute_perf_data
            print "=============================="
    return minute_perf_data
```

初看上述逻辑结构符合直觉，并且也顺利跑了起来，数值似乎赋值成功。但是仔细单步运行调试数据却发现，从第2个虚拟机开始的数据会覆盖第一个虚拟机的数据（实际是覆盖了`time_vcpu_perf_data`），因为一行行读取数据切换到下一个虚拟机的时候，`time_vcpu_perf_data`这个字典并没有重构，依然是上一个虚拟机的字典（内存空间引用相同），这就导致每个虚拟机的`time_vcpu_perf_data`最后都变成一样的数据（也就是最后一组虚拟机的数据）。

我又换了一种思路，想先构建好 `minute_perf_data => vm_time_perf_data => time_vcpu_perf_data` 的结构，然后依次读取行数据的时候，同时引用3个key来填写`vcpu_perf_data`，代码如下：

```
from collections import defaultdict

def get_minute_perf_data(perf_data):
    
    minute_perf_data = defaultdict(dict)
    vm_time_perf_data = defaultdict(dict)
    time_vcpu_perf_data = defaultdict(list)
    vcpu_perf_data = []
    
    vm_name = ""
    time_str = ""
    vcpu_str = ""
    
    minute_perf_data[vm_name] = vm_time_perf_data
    vm_time_perf_data[time_str] = time_vcpu_perf_data
    time_vcpu_perf_data[vcpu_str] = vcpu_perf_data
	
	with open(perf_data,'r') as f:
	    for line in f:
		    items = line.split()
		    vm_name = items[2]
			print "vm_name: %s" % vm_name
			
			time_str = items[1].split(':')[2]
			print "time_str: %s" % time_str
			vcpu_str = items[3]
			print "vcpu_str: %s" % vcpu_str
            
            for i in range(4,8):
                vcpu_perf_data.append(float(items[i]))
            print "vcpu_perf_data: %s" % vcpu_perf_data
			
			minute_perf_data[vm_name][time_str][vcpu_str] = vcpu_perf_data
```

然而，直觉却没能绕过python的语法问题，此时执行报错显示：

```
defaultdict(<type 'dict'>, {'': defaultdict(<type 'dict'>, {'': defaultdict(<type 'list'>, {'': []})})})
vm_name: i-64bcnnqdc
time_str: 04
vcpu_str: 0
vcpu_perf_data: [27.986, 0.308, 71.114, 0.592]
Traceback (most recent call last):
  File "./cpu_steal.bak1", line 313, in <module>
    main()
  File "./cpu_steal.bak1", line 304, in main
    minute_perf_data = get_minute_perf_data(g_perf_data)
  File "./cpu_steal.bak1", line 180, in get_minute_perf_data
    minute_perf_data[vm_name][time_str][vcpu_str] = vcpu_perf_data
KeyError: '04'
```

上述报错让我很困惑，虽然数据类型是正确的，`time_str` 确实是字符类型，数值是`04`，但是Python不能让我使用这种方式来给嵌套的字典（nested dictionary）添加数据。

我google了一下，发现原来Python可以采用非常巧妙的lambda结构来实现多层嵌套字典 - [python generating nested dictionary key error](http://stackoverflow.com/questions/20410044/python-generating-nested-dictionary-key-error)

改写如下：

```
from collections import defaultdict

def get_minute_perf_data(perf_data):
    mydict = lambda: defaultdict(mydict)
    minute_perf_data = mydict()
	
    with open(perf_data,'r') as f:
        for line in f:
            items = line.split()
            
            vm_name = items[2]
            time_str = items[1].split(':')[2]
            vcpu_str = items[3]
			
            vcpu_perf_data = []
            for i in range(4,8):
                vcpu_perf_data.append(float(items[i]))
            print "vcpu_perf_data: %s" % vcpu_perf_data

            minute_perf_data[vm_name][time_str][vcpu_str] = vcpu_perf_data
```

无比神奇的`lambda`函数，可以将自己再作为函数无限嵌套，这样就非常容易实现多层嵌套的字典，并且随时可以引用增加数据。
