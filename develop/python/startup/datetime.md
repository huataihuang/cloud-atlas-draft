# 处理时间戳

```python
import datetime

print('Timestamp: {:%Y-%m-%d %H:%M:%S}'.format(datetime.datetime.now()))
print('Timestamp: {:%Y-%b-%d %H:%M:%S}'.format(datetime.datetime.now()))
print('Date now: %s' % datetime.datetime.now())
print('Date today: %s' % datetime.date.today())

today = datetime.date.today()
print("Today's date is {:%b, %d %Y}".format(today))

schedule = '{:%b, %d %Y}'.format(today) + ' - 6 PM to 10 PM Pacific'
schedule2 = '{:%B, %d %Y}'.format(today) + ' - 1 PM to 6 PM Central'
print('Maintenance: %s' % schedule)
print('Maintenance: %s' % schedule2)
```

输出:

```
Timestamp: 2014-10-18 21:31:12

Timestamp: 2014-Oct-18 21:31:12

Date now: 2014-10-18 21:31:12.318340

Date today: 2014-10-18

Today's date is Oct, 18 2014

Maintenance: Oct, 18 2014 - 6 PM to 10 PM Pacific

Maintenance: October, 18 2014 - 1 PM to 6 PM Central
```

我写了一个简单的记录当时执行命令的结果加时间戳记录

```python
cmd = "tsar --check --apache --cpu --mem --load --io --traffic --tcp --partition --nginx --swap"
res = subprocess.check_output(cmd, shell = True).strip().split()
f = open(g_tsar_origin,'w')
f.write("%s %s" % (datetime.now(),res.strip()))
f.close()
```

# unix时间戳和日期转换

使用`datetime`模块可以转换unix时间

```
import datetime
print(
    datetime.datetime.fromtimestamp(
        int("1477290239")
    ).strftime('%Y-%m-%d %H:%M:%S')
)
```

输出显示 `2016-10-24 14:23:59`

> 参考 [Converting unix timestamp string to readable date in Python](http://stackoverflow.com/questions/3682748/converting-unix-timestamp-string-to-readable-date-in-python)

相反，从时间转换成日期转换成unix timestamp方法需要计算，也就是需要计算当前时间到，并且各个python版本的转换方法不同

* Python 2

```
(datetime.now()-datetime(1970, 1, 1)).total_seconds()
```

> 这里`datetime`格式是 `datetime.datetime(2011, 1, 1, 0, 0)` (参考 [datetime Objects](https://docs.python.org/2/library/datetime.html))

```
import datetime
time1=datetime.datetime(2016,10,24,15,30)
print time1
```

例如要查  `2016-10-22 00:55:26` 对应time stamp使用如下方式：

```
(datetime.datetime(2016,10,22,00,55,26) - datetime.datetime(1970,1,1)).total_seconds()
```

* Python 3 (< 3.3)

```
timestamp = (dt - datetime(1970, 1, 1)) / timedelta(seconds=1)
```

* Python 3.3+

```
timestamp = dt.replace(tzinfo=timezone.utc).timestamp()
```

> 参考 [Converting datetime.date to UTC timestamp in Python](http://stackoverflow.com/questions/8777753/converting-datetime-date-to-utc-timestamp-in-python)

# 文件名修改成带时间戳的后缀

```python
def log_rotate(data):
    rt = time.strftime("%Y%m%d")
    rt_date = ""
    rt_data = data+"."+rt
    # if data file is bigger than 10240000 Byte rename it to rt_data
    if os.path.isfile(data) and os.path.getsize(data) > 10240000 :
        os.rename(data, rt_data)
```

> 判断文件大小，超过指定大小进行重命名

# 获取15分钟或1小时后的时间

`datetime`支持`timedelta`函数能够获取指定时间差异的时间

```
d1 = datetime.datetime.now() + datetime.timedelta(minutes=15)
d2 = datetime.datetime.now() + datetime.timedelta(hours=1)
```

```
from datetime import datetime, timedelta
d = datetime.today() - timedelta(days=days_to_subtract)
```

> 参考 

* [In Python, how do I make a datetime that is 15 minutes from now? 1 hour from now? [duplicate]](http://stackoverflow.com/questions/4557577/in-python-how-do-i-make-a-datetime-that-is-15-minutes-from-now-1-hour-from-now)
* [How can I subtract a day from a Python date?](http://stackoverflow.com/questions/441147/how-can-i-subtract-a-day-from-a-python-date)