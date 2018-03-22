Django自带了一个健壮的缓存系统来让你保存动态页面这样避免对于每次请求都重新计算。 

方便起见，Django提供了不同级别的缓存粒度：可以缓存特定视图的输出、可以仅仅缓存那些很难生产出来的部分、或者可以缓存整个网站。

Django也能很好的配合那些“下游”缓存, 比如 Squid 和基于浏览器的缓存。

# 设置缓存

缓存系统需要一些设置才能使用。 也就是说，你必须告诉他你要把数据缓存在哪里- 是数据库中，文件系统或者直接在内存中。

缓存配置是通过setting 文件的CACHES 配置来实现的。

## 分布式缓存

Django支持的最快，最高效的缓存类型, Memcached 是一个全部基于内存的缓存服务，起初是为了解决LiveJournal.com负载来开发的，后来是由Danga开源出来的。

> Memcached 是个守护进程，它被分配了单独的内存块。 它做的所有工作就是为缓存提供一个快速的添加，检索，删除的接口。 所有的数据直接存储在内存中，所以它不能取代数据库或者文件系统的使用。

在安装 Memcached 后， 还需要安装 Memcached 依赖模块。 有几个Python Memcached绑定可用；两个最常见的是`python-memcached`和`pylibmc`。

需要在Django中使用Memcached时:

* 将 `BACKEND` 设置为`django.core.cache.backends.memcached.PyLibMCCache` 或者 `django.core.cache.backends.memcached.MemcachedCache` (取决于你所选绑定memcached的方式)
* 将 `LOCATION` 设置为 `ip` 值，`port` 是 `Memcached` 守护进程的`ip`地址， `ip:port` 是Memcached 运行的端口。或者设置为 `path` 值，`unix:path` 是 Memcached Unix socket file的路径

这个例子中，Memcached 运行在本地(127.0.0.1) 的11211端口，使用python-memcached（也就是需要这么一个python插件） 绑定：

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
```

Memcached 通过一个本地的Unix socket file/tmp/memcached.sock 来交互，也要使用python-memcached绑定：

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': 'unix:/tmp/memcached.sock',
    }
}
```

当使用pylibmc绑定时，不要包含unix:/前缀：

```
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.PyLibMCCache',
        'LOCATION': '/tmp/memcached.sock',
    }
}
```

> Memcached有一个非常好的特点就是可以让几个服务的缓存共享。 这就意味着你可以再几个物理机上运行Memcached服务，这些程序将会把这几个机器当做 同一个 缓存，从而不需要复制每个缓存的值在每个机器上。 要利用此功能，请将LOCATION中的所有服务器地址以分号或逗号分隔的字符串或列表形式包含。

这个例子，缓存通过下面几个 Memcached 实例共享，IP地址为172.19.26.240 (端口 11211), 172.19.26.242 (端口 11212), and 172.19.26.244 (端口 11213):

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': [
            '172.19.26.240:11211',
            '172.19.26.242:11212',
            '172.19.26.244:11213',
        ]
    }
}
```

## 数据库缓存

Django 可以把缓存保存在你的数据库里。 如果你有一个快速的、专业的数据库服务器的话那这种方式是效果最好的。

为了把数据表用来当做你的缓存后台：

把BACKEND设置为`django.core.cache.backends.db.DatabaseCache`
把 `LOCATION` 设置为 `tablename`， 数据表的名称。 这个名字可以是任何你想要的名字，只要它是一个合法的表名并且在你的数据库中没有被使用过。
在这个示例中，缓存表的名字是 `my_cache_table`:

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'my_cache_table',
    }
}
```

### 创建缓存表

使用数据库缓存之前，你必须用这个命令来创建缓存表：

```
python manage.py createcachetable
```

> 如果你使用多数据库缓存， createcachetable会在每个缓存中创建一个表。

像 `migrate`, `createcachetable` 这样的命令不会碰触现有的表。 它只创建非现有的表。

要打印要运行的SQL而不是运行它，请使用`createcachetable --dry-run`选项。

### 多数据库

如果你在多数据库的情况下使用数据库缓存，你还必须为你的数据库缓存表设置路由说明。 出于路由的目的，数据库缓存表会在一个名为 `django_cache`的应用下的`CacheEntrymodel`中出现。

下面的路由会分配所有缓存读操作到 `cache_replica`， 和所有写操作到`cache_primary`. 缓存表只会同步到 `cache_primary`:

```python
class CacheRouter(object):
    """A router to control all database cache operations"""

    def db_for_read(self, model, **hints):
        "All cache read operations go to the replica"
        if model._meta.app_label == 'django_cache':
            return 'cache_replica'
        return None

    def db_for_write(self, model, **hints):
        "All cache write operations go to primary"
        if model._meta.app_label == 'django_cache':
            return 'cache_primary'
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        "Only install the cache model on primary"
        if app_label == 'django_cache':
            return db == 'cache_primary'
        return None
```

## 文件系统缓存

基于文件的缓存后端序列化和存储每个缓存值作为一个单独的文件。 为了使用这个文件缓存，你要设置`BACKEND`为 "`django.core.cache.backends.filebased.FileBasedCache`" 并且 `LOCATION` 设置为一个合适的目录。 例如，把缓存储存在 `/var/tmp/django_cache`,就用这个设置:

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': '/var/tmp/django_cache',
    }
}
```

## 本地内存缓存

这是默认的缓存，如果你不在指定其他的缓存设置。 如果你想要缓存具有内存的速度优势但是又但又不具备运行 `Memcached`功能, 那就考虑一下本地内存缓存吧。 这个缓存是`per-process`和线程安全的。 要使用它，请将BACKEND设置为"`django.core.cache.backends.locmem.LocMemCache`"。 像这样：

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
```

## 虚拟缓存（用于开发）

最后, Django有一个 “dummy” 缓存，而且还不是真正的缓存– 它只是提供了一个缓存接口，但是什么也不做。

如果你有一个生产站点使用重型高速缓存在不同的地方，但一个开发/测试环境中，你不想缓存，不希望有你的代码更改为后面的特殊情况，这非常有用。 要激活虚拟缓存，请设置BACKEND，如下所示：

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
```

# 缓存参数

上述每一个缓存后台都可以给定一些额外的参数来控制缓存行为， 这些参数在可以在CACHES setting中以额外键值对的形式给定。

> 详见[Django 1.11.6 文档: Django的缓存框架](https://yiyibooks.cn/xx/Django_111/topics/cache.html)原文！

# 下游缓存

另一种类型的缓存也与Web开发相关：由“下游”缓存执行的缓存。 这些系统即使在请求到达您的网站之前也为用户缓存页面。

下游缓存是一个很好的效率提升，但是有一个危险：许多网页的内容基于身份验证和大量其他变量，缓存系统盲目保存纯粹基于URL的网页可能会暴露不正确或敏感数据到后续这些页面的访问者。

幸运的是，HTTP提供了这个问题的解决方案。 存在多个HTTP报头以指示下游高速缓存根据指定的变量来使其高速缓存内容不同，并且指示高速缓存机制不缓存特定页面。

# 参考

* [Django 1.11.6 文档: Django的缓存框架](https://yiyibooks.cn/xx/Django_111/topics/cache.html)