当REST接口提交了model记录之后，希望能够触发一个特定的操作。

Django支持定制`save()`相关的操作哦，例如使用`post_save()`信号或者 `pre_save()`。

在`models.py`中添加

```python
@receiver(pre_save, sender=MainModel)
def save_a_historicmodel(sender, **kwargs):
    #do your save historicmodel logic here
``` 

或者

```python
def save_a_historicmodel(sender, instance, created, **kwargs):
    print "Post save was triggered! Instance:", instance

signals.post_save.connect(save_a_historicmodel, sender=MainModel)
```

这样，每次`MainModel`保存时候信号都会触发。

> 详细文档见 [post_save](https://docs.djangoproject.com/en/1.11/ref/signals/#django.db.models.signals.post_save)

# Django Signals

Django Signals是一个当某些事件发生时，允许解耦的应用程序（`decoupled applications`）获得通知的策略。

> `decoupled applications` - 解耦应用程序
>
> 低耦合，高内聚---模块之间低耦合，模块内部高内聚。一个系统有多个模块组成，在划分模块时，要把功能关系紧密的放到一个模块中(高内聚)，功能关系远的放到其它模块中。模块之间的联系越少越好，接口越简单越好(低耦合，细线通信)。如果划分的模块之间接口很复杂，说明功能划分得不太合理，模块之间的耦合太高了，同时也说明某模块的内聚也不高。 - [程序设计经常提到的解耦，到底是要解除什么之间的耦合？](https://www.zhihu.com/question/20278169)

例如，每次一个给定的模型（Model）实例被更新需要废弃掉一个缓存页面，但是，基于这个模型的一系列位置需要更新。此时可以使用`singals`，hook一些代码片段在这个指定model保存动作被触发时执行。

另一种常用的案例是使用Profile策略通过一对一（one-to-one）关系来扩展定制Django User。通常会使用一个信号调度器（`signal dispatcher`）来监听用户的`post_save`事件以便能够更新Profile实例。 -- 可以参考[How to Extend Django User Model](https://simpleisbetterthancomplex.com/tutorial/2016/07/22/how-to-extend-django-user-model.html#onetoone)

## Django Signals工作原理

`Observer Design Pattern`（观察者设计模式）

在信号机制中有两个关键因素：发送者和接收者。正如名字所示，发送者是负责调度一个信号，接收者则是负责接受信号并作一些事情。

`receiver`接收者必须是一个功能模块（`function`）或者是一个实例方法(`instance method`)才能接收信号。

`sender`发送者必须是一个Python对象，或者是None才能从任何发送者这里接收事件。

连接发送者和接收者之间的是"信号调度器"（`signal dispatchers`），是通过`connect`方法的`Signal`实例。

Django核心已经定义了`ModelSignal`，也就是一个`Signal`子类，允许发送者以`app_label.ModelName`形式快速指定为一个字符串。但是，你需要使用`Signal`类来创建定制的信号。

要接收一个信号，需要注册一个`receiver`功能，这样当信号被通过`Signal.connect()`方法发送的时候来获取调用，

## Django Signal使用

这里举例内建信号`post_save`。这段代码位于`django.db.models.signals`模块。这个信号在模型完成`save`方法后触发：

```python
from django.contrib.auth.models import User
from django.db.models.signals import post_save

def save_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(save_profile, sender=User)
```

> `contrib`意思是**捐献**，通常捐献的开源代码位于这个目录下

以上案例中，`save_profile`就是接收者功能模块，`User`是发送者而`post_save`是信号。可以解读为：每次当一个`User`实例完成执行它的`save`方法后，则`save_profile`功能就被执行。

如果抑制`sender`参数，类似：`post_save.connect(save_profile)`，则`save_profile`功能就会在**任何**Django模型执行`save`方法的时候执行。

另一种注册信号的方法是使用`@receiver`装饰器（decorator）

```python
def receiver(signal, **kwargs)
```

这里`signal`参数可以是一个信号实例（`Signal` instance）或者是一个信号实例的列表/元组（a list/tuple of `Signal` instances）。

> `装饰器`（decorator）是指代码运行期间动态添加功能的方式（不修改函数的定义） - [廖雪峰的Python 2.7教程：装饰器](https://www.liaoxuefeng.com/wiki/001374738125095c955c1e6d8bb493182103fac9270762a000/001386819879946007bbf6ad052463ab18034f0254bf355000)



```python
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()
```

如果希望注册 receiver function到不同的信号，可以如下：

```python
@receiver([post_save, post_delete], sender=User)
```

## Django Signal代码的位置

根据你注册应用程序信号的不同位置，可能由于导入代码产生不同的边缘影响。所以，建议避免将`Signal`代码放在`models`方法或者应用程序的根方法中。

### 使用`@receiver()`装饰器

Django文档建议将信号存放在app的配置文件。以下是一个名为`profiles`的Django app：

* `profiles/signals.py`:

```python
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from cmdbox.profiles.models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
```

* `profiles/app.py`:

```python
from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _

class ProfilesConfig(AppConfig):
    name = 'cmdbox.profiles'
    verbose_name = _('profiles')

    def ready(self):
        import cmdbox.profiles.signals  # noqa
```

* `profiles/__init__.py`:

```python
default_app_config = 'cmdbox.profiles.apps.ProfilesConfig'
```

在以上案例中，只时在`ready()`方法中导入的`signals`模块会工作，因为这里使用了`@receiver()`装饰器。如果使用`connect()`方式来连接`receiver function`，则参考以下案例。

### 使用`connect()`方法

* `profiles/signals.py`:

```python
from cmdbox.profiles.models import Profile

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
```

* `profiles/app.py`:

```python
from django.apps import AppConfig
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.utils.translation import ugettext_lazy as _

from cmdbox.profiles.signals import create_user_profile, save_user_profile

class ProfilesConfig(AppConfig):
    name = 'cmdbox.profiles'
    verbose_name = _('profiles')

    def ready(self):
        post_save.connect(create_user_profile, sender=User)
        post_save.connect(save_user_profile, sender=User)
```

* `profiles/__init__.py`:

```python
default_app_config = 'cmdbox.profiles.apps.ProfilesConfig'
```

## `instance`使用（补充）

现在有一个问题，就是如果通过`Signals`触发了某个动作，而这个动作恰好就是要处理刚才`Model`中`post_save`保存的那行记录，该如何处理呢？

这里甬道的就是`instance`，这个`instance`就是刚才保存的那行数据库记录。举例：

* `signals.py`

```python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db.models.signals import post_save
from django.dispatch import receiver

from notify.views import send_msg
from .models import PizzaCooked

@receiver(post_save, sender=PizzaCooked)
def create_pizzacooked_notify(sender, instance, created, **kwargs):
    if created:
        customer = instance.customer
        pizza_name = instance.pizza_name
        pizza_size = instance.pizza_size
        cook_time = instance.cook_time
        msg = "通知：\r亲爱的%s，您订购的 %s %s 披萨已经于 %s 制作完成，请取用" % (customer, pizza_name, pizza_size, cook_time)
        send_msg(msg)
```

以上案例，即通过Signal的`post_save`触发消息发送，其中消息发送内容就是从`instance`也就是数据库插入数据字段组合得到。

# Django内建信号

以下是一些有用的Django信号（常用）

## Model Signals

* django.db.models.signals.`pre_init`:

```python
receiver_function(sender, *args, **kwargs)
```

* django.db.models.signals.`post_init`:

```python
receiver_function(sender, instance)
```

* django.db.models.signals.`pre_save`:

```python
receiver_function(sender, instance, raw, using, update_fields)
```

* django.db.models.signals.`post_save`:

```python
receiver_function(sender, instance, created, raw, using, update_fields)
```

* django.db.models.signals.`pre_delete`:

```python
receiver_function(sender, instance, using)
```

* django.db.models.signals.`post_delete`:

```python
receiver_function(sender, instance, using)
```

* django.db.models.signals.`m2m_changed`:

```python
receiver_function(sender, instance, action, reverse, model, pk_set, using)
```

## Request/Response Signals

* django.core.signals.`request_started`:

```python
receiver_function(sender, environ)
```

* django.core.signals.`request_finished`:

```python
receiver_function(sender, environ)
```

* django.core.signals.`got_request_exception`:

```python
receiver_function(sender, request)
```

> 完整列表参考[官方文档](https://docs.djangoproject.com/en/1.9/ref/signals/)

# 参考

* [Django - How to trigger an action when a specific model is saved?](https://stackoverflow.com/questions/15155616/django-how-to-trigger-an-action-when-a-specific-model-is-saved)
* [How to Create Django Signals](https://simpleisbetterthancomplex.com/tutorial/2016/07/28/how-to-create-django-signals.html) - 非常详尽的参考文档，本文根据这篇博文翻译整理