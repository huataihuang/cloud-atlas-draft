
* 简单的`Hello Wrold`的Django程序

```python
import os
import sys

# settings.py部分：
from django.conf import settings

DEBUG = os.environ.get('DEBUG', 'on') == 'on'

SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(32))

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

settings.configure(
    DEBUG=DEBUG,
    SECRET_KEY=SECRET_KEY,
    ALLOWED_HOSTS=ALLOWED_HOSTS,
    ROOT_URLCONF=__name__,
    MIDDLEWARE_CLASSES=(
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
    ),
)

from django.core.wsgi import get_wsgi_application

# view.py部分：
from django.http import HttpResponse

def index(request):
    return HttpResponse('Hello World')

# url.py部分：
from django.conf.urls import url

urlpatterns = (
    url(r'^$', index),
)


application = get_wsgi_application()


if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
```

# WSGI应用

Web服务器网关接口（WSGI）关于Web服务器如何与Django之类的应用框架通信的规范，有PEP333指定，并在PEP3333中改进。有许多使用WSGI规范的Web服务器，包括apache下的mod_wsgi, Gunicorn, uWSGI, CherryPy, Tornado 和 Chaussette。

Django使用`get_wsgi_application`提供了一个用于创建这个应用的简单接口。

安装Gunicorn（纯Python的WSGI应用服务器）：

```
pip install gunicorn
```

然后执行以下命令使用gunicon命令运行前面的hello.py

```
gunicorn hello --log-file=-
```

# 环境变量

在上述简单的`hello.py`中，有很多变量是通过`os.environ.get()`方法读取的，这为Django程序带来了很多灵活性，只需要修改环境变量就可以调整运行：

```
export DEBUG=off
export ALLOWED_HOSTS=localhost,example.com
python hello.py runserver
```

另外可以通过删除环境便令`unset DEBUG`来再次运行。