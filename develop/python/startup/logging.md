Python非常容易实现日志功能，因为提供了`logging`模块方便开发者在代码事件中添加日志调用。事件是通过可选的包含变量的描述信息所组成。事件还有一个重要的特性是可以设置日志级别。

# 什么时候使用`logging`

`logging`提供一系列简化的日志功能，提供级别有`debug()`, `info()`, `warning()`, `error()` 和 `critical()`。

# 简单案例

```python
import logging
logging.warning('Watch out!')  # will print a message to the console
logging.info('I told you so')  # will not print anything
```

上述没有指定输出到文件，则默认在终端输出。

# 日志记录到文件

```python
mport logging
logging.basicConfig(filename='example.log',level=logging.DEBUG)
logging.debug('This message should go to the log file')
logging.info('So should this')
logging.warning('And this, too')
```

注意：在日志文件中会同时记录日志级别，所以默认显示如下：

```
DEBUG:root:This message should go to the log file
INFO:root:So should this
WARNING:root:And this, too
```

如果希望通过命令行参数来设置日志级别，例如`--log=INFO`，则可以使用如下方法获取参数：

```python
getattr(logging, loglevel.upper())
```

以下是一个案例：

```python
# assuming loglevel is bound to the string value obtained from the
# command line argument. Convert to upper case to allow the user to
# specify --log=DEBUG or --log=debug
numeric_level = getattr(logging, loglevel.upper(), None)
if not isinstance(numeric_level, int):
    raise ValueError('Invalid log level: %s' % loglevel)
logging.basicConfig(level=numeric_level, ...)
```

> 这里调用了`basicConfig()`来设置日志级别

# 从多个模块进行日志

如果程序包含多个模块，以下是组织`logging`的一个案例：

```python
# myapp.py
import logging
import mylib

def main():
    logging.basicConfig(filename='myapp.log', level=logging.INFO)
    logging.info('Started')
    mylib.do_something()
    logging.info('Finished')

if __name__ == '__main__':
    main()
```

```python
# mylib.py
import logging

def do_something():
    logging.info('Doing something')
```

此时运行`myapp.py`将在日志文件`myapp.log`看到如下内容：

```
INFO:root:Started
INFO:root:Doing something
INFO:root:Finished
```

# 日志变量值

对于比阿亮数据，可以将变量作为参数传递：

```pyhon
import logging
logging.warning('%s before you %s', 'Look', 'leap!')
```

# 日志格式

```python
import logging
logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
logging.debug('This message should appear on the console')
logging.info('So should this')
logging.warning('And this, too')
```

# 在日志中显示时间

```python
import logging
logging.basicConfig(format='%(asctime)s %(message)s')
logging.warning('is when this event was logged.')
```

则日志如下：

```
2010-12-12 11:41:42,612 is when this event was logged.
```

默认时间格式是ISO8601，即类似如上。如果需要控制日期格式，可以使用`basicconfig`:

```python
import logging
logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
logging.warning('is when this event was logged.')
```

则日志内容如下：

```
12/12/2010 11:46:36 AM is when this event was logged.
```

# 模块话日志

`logging`通过调用`Logger`累的方法来实现，所以创建`logger`对象：

```python
logger = logging.getLogger(__name__)
```

# 配置Logging

```python
import logging

# create logger
logger = logging.getLogger('simple_example')
logger.setLevel(logging.DEBUG)

# create console handler and set level to debug
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

# create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# add formatter to ch
ch.setFormatter(formatter)

# add ch to logger
logger.addHandler(ch)

# 'application' code
logger.debug('debug message')
logger.info('info message')
logger.warn('warn message')
logger.error('error message')
logger.critical('critical message')
```

运行以上案例输入：

```bash
$ python simple_logging_module.py
2005-03-19 15:10:26,618 - simple_example - DEBUG - debug message
2005-03-19 15:10:26,620 - simple_example - INFO - info message
2005-03-19 15:10:26,695 - simple_example - WARNING - warn message
2005-03-19 15:10:26,697 - simple_example - ERROR - error message
2005-03-19 15:10:26,773 - simple_example - CRITICAL - critical message
```

以下哪里创建`logger`和`handler`以及`formatter`

```python
import logging
import logging.config

logging.config.fileConfig('logging.conf')

# create logger
logger = logging.getLogger('simpleExample')

# 'application' code
logger.debug('debug message')
logger.info('info message')
logger.warn('warn message')
logger.error('error message')
logger.critical('critical message')
```

以下是`logging.conf`配置文件：

```ini
[loggers]
keys=root,simpleExample

[handlers]
keys=consoleHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=DEBUG
handlers=consoleHandler

[logger_simpleExample]
level=DEBUG
handlers=consoleHandler
qualname=simpleExample
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=DEBUG
formatter=simpleFormatter
args=(sys.stdout,)

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
datefmt=
```

则日志输出如下

```
$ python simple_logging_config.py
2005-03-19 15:38:55,977 - simpleExample - DEBUG - debug message
2005-03-19 15:38:55,979 - simpleExample - INFO - info message
2005-03-19 15:38:56,054 - simpleExample - WARNING - warn message
2005-03-19 15:38:56,055 - simpleExample - ERROR - error message
2005-03-19 15:38:56,130 - simpleExample - CRITICAL - critical message
```

----

# 简单的日志

* 简单记录日志

```python
import logging
logging.basicConfig(filename='example.log',level=logging.DEBUG)
logging.debug('This message should go to the log file')
logging.info('So should this')
logging.warning('And this, too')
```

* 日志中增加时间戳

```python
import logging
logging.basicConfig(format='%(asctime)s %(message)s')
logging.warning('is when this event was logged.')
```

* 设置日志级别：

```python
import logging
logger = logging.getLogger('myapp')
hdlr = logging.FileHandler('/var/tmp/myapp.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.WARNING)
```

然后通过如下方法记录日志

```python
logger.error('We have a problem')
logger.info('While this is just chatty')
```

> 参考 [Basic example - log to a file](https://docs.python.org/2.3/lib/node304.html)

# 多线程日志记录

以下案例是主线程（initlal）和其他线程同时记录日志的方法

```
import logging
import threading
import time

def worker(arg):
    while not arg['stop']:
```

> 参考 [Logging Cookbook](https://docs.python.org/2/howto/logging-cookbook.html)

# 日志文件中的空行

```python
g_tsar_log="/tmp/tsar.logging"
logging.basicConfig(filename=g_tsar_log,format='%(asctime)s %(message)s')
logging.warning(res)
```

但是发现日志中每行记录后面都有一个空白行，所以记录日志中增加`strip()`去除多余回行

```python
logging.warning(res.strip())
```

# 参考

* [Logging HOWTO](https://docs.python.org/2/howto/logging.html)
* [Logging Cookbook](https://docs.python.org/3/howto/logging-cookbook.html)
* [Logging HOWTO:Basic Logging Tutorial](https://docs.python.org/2/howto/logging.html)