在使用了Django REST Framework构建REST接口，我创建了一个简单的view来查询最近2分钟的数据库记录

```python
from datetime import datetime, timedelta

class TestViewSet(viewsets.ModelViewSet):

    time_threshold = datetime.now() - timedelta(minutes = 1)
    queryset = Test.objects.all().filter(count_time__gte = time_threshold).order_by('count_time')

    serializer_class = TestSerializer
```

但是出乎我的意料，虽然看上去没有错误的代码(我的Test视图就是查询`count_time`最近2分钟的数据)，但是每次查询得到的数据集远超过2分钟。经过仔细对比，发现每次查询得到的数据，差不多就是我当天的全部数据。

这是怎么回事？我明明只查询2分钟数据。

参考 [Django Logging](https://docs.djangoproject.com/en/3.1/topics/logging/) 配置 `settings.py` 增加如下配置，注意 `loggers` 段落配置 `level` 级别是 `DEBUG` :

```python
DEBUG = True

# LOGGING

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            # 以下日志级别打开了 DEBUG ，可以显示完整排查信息
            'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),
            'propagate': False,
        },
    },
}
```

然后再次运行访问这个view，就可以看到数据库查询的日志如下:

```bash
(0.000) SELECT @@SQL_AUTO_IS_NULL; args=None
(0.000) SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; args=None
(0.005) SELECT COUNT(*) AS `__count` FROM `api_Test` WHERE `api_Test`.`count_time` >= '2021-02-21 08:11:17.385916'; args=('2021-02-21 08:11:17.385916',)
(0.001) SELECT `api_Test`.`id`, `api_Test`.`access_count`, `api_Test`.`count_time` FROM `api_Test` WHERE `api_Test`.`count_time` >= '2021-02-21 08:11:17.385916' ORDER BY `api_Test`.`count_time` ASC LIMIT 10; args=('2021-02-21 08:11:17.385916',)
```

> 注意： `settings.py` 中必须启用 `DEBUG = True` 才能看到上述SQL调试信息，如果关闭了 `DEBUG = False` 就只能看到Python库加载以及异常错误，但是不会打印出SQL。

我惊讶地发现，原来 Django REST Framework 或者说 Django 提交给数据库查询时间 `time_threshold` 实际上是时区0，也就是格林威治时间，而不是本地的东8区时间，所以导致查询时间范围提前了8个小时。所以查询出了过多的数据。

我又注意到 `python manage.py runserver` 启动时，有一个提示警告：

```
/Users/huatai/onesre_venv3/lib/python3.9/site-packages/django/db/models/fields/__init__.py:1367: RuntimeWarning: DateTimeField Test.count_time received a naive datetime (2021-02-21 03:50:13.414188) while time zone support is active.
  warnings.warn("DateTimeField %s received a naive datetime (%s)"
System check identified no issues (0 silenced).
```

这显然很可能就是导致SQL时间错误的原因。

参考 [Djgnso: Time zones](https://docs.djangoproject.com/en/3.1/topics/i18n/timezones/) 可以看到默认是关闭时区支持的。要激活时区支持，需要在设置文件中设置 `USE_TZ = True` 。但是，需要注意，如果使用 `django-admin startproject` 创建的 `settings.py` 就会默认包含 `USE_TZ = True` 。也就是说，我的开发项目默认是启用了时区支持。

# 时区时间

我参考了 [Python get current time in right timezone](https://stackoverflow.com/questions/25837452/python-get-current-time-in-right-timezone)

* 当前时区的naive time其实是默认时间:

```python
from datetime import datetime
naive_dt = datetime.now()
```

* 获取utc时间作为navie time:

```python
naive_utc_dt = datetime.utcnow()
```

* `datetime.now()` 可以传递 `tz` 参数 `timezone.utc` 来获得UTC时间，也能够使用 `astimezone()` 转换成本地时区时间

```python
from datetime import datetime, timezone

utc_dt = datetime.now(timezone.utc) # UTC time
dt = utc_dt.astimezone() # local time
```

*  最简单的获取指定时区时间的方法是使用 `pytz`

```python
import pytz

tz = pytz.timezone('Europe/Berlin')
berlin_now = datetime.now(tz)
```

* 另外一种方式是使用 `timezone` 来获取时间，见 [django's timezone.now does not show the right time](https://stackoverflow.com/questions/16037020/djangos-timezone-now-does-not-show-the-right-time)

```python
from django.utils import timezone
timezone.localtime(timezone.now())
```

在 [“django filter by date range” Code Answer’s](https://www.codegrepper.com/code-examples/python/django+filter+by+date+range) 提供了案例参考，片段如下：

```python
        now = timezone.now()
        # When time zone support is enabled, convert "now" to the user's time
        # zone so Django's definition of "Today" matches what the user expects.
        if timezone.is_aware(now):
            now = timezone.localtime(now)
```

完整代码如下:

```python
import datetime

from django.contrib import admin
from django.contrib.admin.filters import DateFieldListFilter
from django.utils.translation import gettext_lazy as _


class MyDateTimeFilter(DateFieldListFilter):
    def __init__(self, *args, **kwargs):
        super(MyDateTimeFilter, self).__init__(*args, **kwargs)

        now = timezone.now()
        # When time zone support is enabled, convert "now" to the user's time
        # zone so Django's definition of "Today" matches what the user expects.
        if timezone.is_aware(now):
            now = timezone.localtime(now)

        today = now.date()

        self.links += ((
            (_('Next 7 days'), {
                self.lookup_kwarg_since: str(today),
                self.lookup_kwarg_until: str(today + datetime.timedelta(days=7)),
            }),
        ))

class BookAdmin(admin.ModelAdmin):
    list_filter = (
        ('published_at', MyDateTimeFilter),
    )
```

# Django REST Framework使用UTC时间

我尝试了 `views.py`

```python
from datetime import datetime, timedelta

class TestViewSet(viewsets.ModelViewSet):

    tz = pytz.timezone('Asia/Shanghai')
    time_threshold = datetime.now(tz) - timedelta(minutes = 1)
    queryset = Test.objects.all().filter(count_time__gte = time_threshold).order_by('count_time')

    serializer_class = TestSerializer
```

明确指定了时间采用本地时区时间，但是，我在DEBUG信息中看到，Django REST Framework 传递的依然是UTC时间，和之前完全相同。

这是为何呢？我加了 logger 打印出 `time_threshold` ，确定这个值就是当前本地时间。但是 DRF 发给数据库的SQL语句依然是使用了UTC时间。

所以我修改 `settings.py` 关闭 timezone

```python
#USE_TZ = True
USE_TZ = False
```

果然，这样绕开了问题，现在 DRF 传递的时间已经是本地时间了

```bash
(0.000) SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; args=None
(0.005) SELECT COUNT(*) AS `__count` FROM `api_Test` WHERE `api_Test`.`count_time` >= '2021-02-21 21:23:25.401293'; args=('2021-02-21 21:23:25.401293',)
(0.002) SELECT `api_Test`.`id`, `api_Test`.`waf_count`, `api_Test`.`count_time` FROM `api_Test` WHERE `api_Test`.`count_time` >= '2021-02-21 21:23:25.401293' ORDER BY `api_Test`.`count_time` ASC LIMIT 10; args=('2021-02-21 21:23:25.401293',)
```

终于，可以看到正确DRF传递正确本地时间，查询出来的数据相对就很少了，却是看上去是1分钟内时间了。

我的数据库记录是每5秒插入1条记录，所以一分钟，应该有12条记录：

```sql
select * from api_Test where count_time > date_sub(now(), interval 1 minute);
```

从DRF查询页面，我看到返回了13条记录，大致不差了。

# View只刷新一次数据集?

然而，还有bug...

当DRF的web页面刷新几次，我又发现了一个bug，可以看到返回的数据从 13 条记录开始，一点点增长上去了，就好像新加入数据库的数据不断加入一样。我的查询不是只返回最近的1分钟么？

我在view视图的 `queryset` 前后加上了 `logger` ，看出了端倪：

```python
from datetime import datetime, timedelta

class TestViewSet(viewsets.ModelViewSet):

    logger.debug('=========')
    logger.debug('Test ME')
    # settings.py 关闭了 
    time_threshold = datetime.now() - timedelta(minutes = 1)
    logger.debug('time_threshold: %s', time_threshold)
    logger.debug('=========')
    queryset = Test.objects.all().filter(count_time__gte = time_threshold).order_by('count_time')

    serializer_class = TestSerializer
```

我可以看到当 `view.py` 修改或者重启启动一次project，就会看到输出一次:

```
Waiting for apps ready_event.
=========
Test ME
time_threshold: 2021-02-21 21:23:25.401293
=========
Apps ready_event triggered. Sending autoreload_started signal.
...
```

但是...但是， **只输出一次** ，不管以后从WEB访问view多少次，都不会看到我的上述标记的日志打印。也就是说，视图 `view` 只在程序初始化的时候调用一次，然后初始化以后就保持不变。所以，对于数据库查询，如果 `queryset` 写在视图中，如果这个 `queryset` 中有变量，则这个变量始终保持这个视图调用初始化的时候的值。这样就导致查询的语句不能变化。

# class variable 和 method

参考 [Django seems to be caching datetime.now()](https://stackoverflow.com/questions/10741201/django-seems-to-be-caching-datetime-now) 提到了原因，是因为视图定义了 queryset 作为类变量，所以这个只会执行一次，仅在类被初始化导入时执行一次。需要将这些行移动到一个方法中，这样每次视图被调用时候都会执行。

我尝试将代码迁移到视图的`list`方法中:

```python
from datetime import datetime, timedelta
from rest_framework import viewsets
from rest_framework.response import Response

class TestViewSet(viewsets.ModelViewSet):

    serializer_class = TestSerializer

    def list(self, request):
        time_threshold = datetime.now() - timedelta(minutes = 1)
        queryset = Test.objects.all().filter(count_time__gte = time_threshold).order_by('count_time')
        return Response(serializer_class.data)
```

但是运行报错

```
...
AssertionError: `basename` argument not specified, and could not automatically determine the name from the viewset, as it does not have a `.queryset` attribute.
```

这个报错在 [报错：AssertionError: `basename` argument not specified, and could not automatically determine the name from the viewset, as it does not have a `.queryset` attribute.](https://www.cnblogs.com/wangyingblock/p/13801198.html) 提供了说明和解决方法：

因为我把 viewset 中的 queryset 搬迁到了 method 中，当 viewset 中没有定义queryset，则需要在路由的注册中加上 basename ，需要需要把 `url.py` 中

```python
router.register(r'test', views.TestViewSet)
```

```python
router.register(r'test', views.TestViewSet, basename='test')
```

原文见 [DRF: Routers](https://www.django-rest-framework.org/api-guide/routers/):

> basename - The base to use for the URL names that are created. If unset the basename will be automatically generated based on the queryset attribute of the viewset, if it has one. Note that if the viewset does not include a queryset attribute then you must set basename when registering the viewset.

在 [Overriding Django Rest Framework Viewsets](https://harrymoreno.com/2019/06/12/Overriding-Django-Rest-Framework-viewsets.html)  有一些很好的案例，所以改成成

```python
from datetime import datetime, timedelta
from rest_framework import viewsets

class TestViewSet(viewsets.ModelViewSet):

    serializer_class = HygonWafMonitorSerializer

    def get_queryset(self):
        time_threshold = datetime.now() - timedelta(minutes = 1)
        queryset = Test.objects.all().filter(count_time__gte = time_threshold).order_by('count_time')
        return queryset
```

# 关闭分页

由于我们使用了1分钟过滤数据集，所以返回数据集很小，不需要分页，所以在视图中关闭分页

```python
...
class TestViewSet(viewsets.ModelViewSet):
    ...
    pagination_class = None
```

# 参考

* [“django filter by date range” Code Answer’s](https://www.codegrepper.com/code-examples/python/django+filter+by+date+range)
* [Djgnso: Time zones](https://docs.djangoproject.com/en/3.1/topics/i18n/timezones/)
* [Working with Datetime Objects and Timezones in Python](https://howchoo.com/g/ywi5m2vkodk/working-with-datetime-objects-and-timezones-in-python)
* [Python get current time in right timezone](https://stackoverflow.com/questions/25837452/python-get-current-time-in-right-timezone)
* [Django query filter with variable column](https://stackoverflow.com/questions/4720079/django-query-filter-with-variable-column)