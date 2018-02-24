Django REST framework提供了内置的很多过滤方法（查询），[文档](http://www.django-rest-framework.org/api-guide/filtering/)非常详尽，例如 URL过滤，查询参数过滤。

# 内置过滤

* [DjangoFilterBackend](http://www.django-rest-framework.org/api-guide/filtering/#djangofilterbackend)
* [SearchFilter](http://www.django-rest-framework.org/api-guide/filtering/#searchfilter) - 内建的控制台，简单查询。底层是基于[Django admin's search functionality](https://docs.djangoproject.com/en/stable/ref/contrib/admin/#django.contrib.admin.ModelAdmin.search_fields)
* [OrderingFilter](http://www.django-rest-framework.org/api-guide/filtering/#orderingfilter) - 提供简单的结果排序功能（参数）
* [DjangoObjectPermissionsFilter](http://www.django-rest-framework.org/api-guide/filtering/#djangoobjectpermissionsfilter)
...

# 第三方包

> 第三方包在特定环境下更为简便

* [Django REST framework filters package](http://www.django-rest-framework.org/api-guide/filtering/#django-rest-framework-filters-package)
* [Django REST framework full word search filter](http://www.django-rest-framework.org/api-guide/filtering/#django-rest-framework-full-word-search-filter) - 全文搜索，作为替代`filters.SerchFilter`
* [Django URL Filter](http://www.django-rest-framework.org/api-guide/filtering/#django-url-filter) - 这是一个非常简洁并且用户友好URL的过滤方法，推荐使用

## Django URL Filter使用简介

[django-url-filter](https://github.com/miki725/django-url-filter)提供了一个安全方式通过面向用户友好的URLs来过滤数据，文档可参考 [Django URL Filter](http://django-url-filter.readthedocs.io/)

* 安装`django-url-filter`

```
pip install django-url-filter
```

* 定制过滤

`django-url-filter`使用非常方便，并且和Django REST framework无缝结合，只需要简单指定过滤字段，就可以在URL中使用。

举例，原先DRF的视图代码如下：

```python
from rest_framework import viewsets
from api.serializers import UserSerializer
from api.models import User

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('create_time')
    serializer_class = UserSerializer
```

只需要添加`url_filter`过滤模块，然后再增加字段定义就可以：

```python
from url_filter.integrations.drf import DjangoFilterBackend

from rest_framework import viewsets
from api.serializers import UserSerializer
from api.models import User

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('create_time')
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username', 'email']
```

然后就可以在URL中使用如下查询：

```bash
# get user with id 5
example.com/users/?id=5

# get user with id either 5, 10 or 15
example.com/users/?id__in=5,10,15

# get user with id between 5 and 10
example.com/users/?id__range=5,10

# get user with username "foo"
example.com/users/?username=foo

# get user with username containing case insensitive "foo"
example.com/users/?username__icontains=foo

# get user where username does NOT contain "foo"
example.com/users/?username__icontains!=foo

# get user who joined in 2015 as per user profile
example.com/users/?profile__joined__year=2015

# get user who joined in between 2010 and 2015 as per user profile
example.com/users/?profile__joined__range=2010-01-01,2015-12-31

# get user who joined in after 2010 as per user profile
example.com/users/?profile__joined__gt=2010-01-01
```

在[Django REST framework - filtering against query param](https://stackoverflow.com/questions/21182725/django-rest-framework-filtering-against-query-param)提供了参考

注意：实际上过滤的规则和Django相同，采用约定俗成的方法，例如，要选择时间范围：

> 假设数据库字段是`create_time`

```bash
api/users/?create_time__year=2018

# 注意：day时间范围是0:00，所以如果要查2018年2月2日全天数据，输入是 "2018-02-02,2018-02-03"
api/users/?create_time__range=2018-02-02,2018-02-03

api/users/?create_time__gte=2018-02-02&create_time__lt=2018-02-03
```

注意：在URL中传递"时间"需要做一个字符编码转换，例如

| 原始字符 | 转换URL(`urlencode`) |
| ---- | ---- |
| `空格` | `+` |
| `:` | `%3a` |

> 通过google可以搜索到在线转换urlencode，不过，使用python很容易实现，见下文

举例：

* `2017-11-10 11:02` 转换到URL `2017-11-10+11%3a02`

所以，如果要查询 `2017-11-10 11:00` 到 `2017-11-10 11:10`的数据，应该传递

```
api/users/?create_time__gte=2017-11-10+11%3a00&create_time__lt=2017-11-10+11%3a10
```

# 使用Python转换字符串

> 参考[How to urlencode a querystring in Python?](https://stackoverflow.com/questions/5607551/how-to-urlencode-a-querystring-in-python)

## Python2实现urlencode

Python 2使用 [urllib.quote_plus](https://docs.python.org/2/library/urllib.html#urllib.quote_plus) 转换

```
>>> import urllib
>>> urllib.quote_plus('2017-11-10 11:02')
'2017-11-10+11%3A02'
```

## Python3实现urlencode

在Python 3中，`urllib`包被分解成更小的组件，需要使用 [urllib.parse.quote_plus](https://docs.python.org/3/library/urllib.parse.html#urllib.parse.quote_plus)

```
>>> import urllib.parse
>>> urllib.parse.quote_plus('2017-11-10 11:02')
'2017-11-10+11%3A02'
```

> 另外，在 [cdown/gist:1163649](https://gist.github.com/cdown/1163649) 提供了一个shell脚本来转换

# 参考

* [Django REST framework: Filtering](http://www.django-rest-framework.org/api-guide/filtering/)
* [How to urlencode a querystring in Python?](https://stackoverflow.com/questions/5607551/how-to-urlencode-a-querystring-in-python)