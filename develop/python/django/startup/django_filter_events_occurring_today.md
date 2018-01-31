Django支持数据库表查询的过滤功能，相当于sql查询中的条件。

对于时间处理，例如，需要找出今天发生的事件可以采用`datetime`阀值：

```python
from datetime import datetime, timedelta, time

today = datetime.now().date()
tomorrow = today + timedelta(1)
today_start = datetime.combine(today, time())
today_end = datetime.combine(tomorrow, time())
```

这样就可以按照时间范围来过滤：

```python
class EventManager(models.Manager):
    def bookings_today(self, location_id):
        # Construction of today_end / today_start as above, omitted for brevity
        return self.filter(location=location_id, start__lte=today_end, end__gte=today_start)
```

> `XXXX__lte`在Django中表示字段`XXXX`值小于(`less than equal`)；`YYYY__gte`在Django中表示字段`YYYY`值大于（`great than equal`）


# 参考

* [Django filter events occurring today](https://stackoverflow.com/questions/11245483/django-filter-events-occurring-today)