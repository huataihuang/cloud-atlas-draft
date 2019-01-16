# 标准库日志模块

Python在标准库 中包含了一个日志模块，提供了可伸缩的框架来发送日志消息。这个模块被广泛使用并且成为大多数开发者用于日志记录。

这个日志模块提供了一种应用程序配置的不同处理方式，以及路由日志消息到不同处理器的方法。这样通过一个高度可配置来处理不同的使用场景。

为了发出一个日志消息，调用者首先需要请求一个命名的logger。这个命名被应用程序用于配置不同的规则用于不同的loggers。这个logger就可以用于发送简单的格式化的消息给不同的日志级别（DEBUG, INFO, ERROR 等等），然后logger即可以被应用程序用于处理不同优先级的消息。

以下是例子：

```python
import logging
log = loggging.getLogger("my-logger")
log.info("Hello, world")
```

在内部，这个消息被加入到一个LogRecord对象，然后路由到这个logger注册的处理器对象。这个处理器就使用格式器将这个LogRecord转换成字符串并发送这个字符串。

幸运的是，程序员并不需要详细了解这个机制。Python文档包含了一个如何使用logging模块的文档。以下是该文档的一个使用指南。

# 从模块发出到日志

模块，也就是其他程序寓言所说的库，是发送日志消息到最好方式。模块不需要配置如何记录日志，因为这是应用程序的责任，只要导入和使用模块。模块只需要让应用程序能够路由它的日志消息就可以了。

基于上述理由，每个模块通常会使用一个logger，以便应用程序能够路由不同模块的日志，并使得模块中的日志代码简化。

```python
import loggin

log = logging.getLogger(__name__)

def do_something():
    log.debug("Doing something!")
```

就这么简单，**在Python中，`__name__`包含了当前模块到完整名字，所以可以在任何模块使用。**

# 配置logging

主应用将配置loggging子系统，这样日志消息就会去往它们该去到地方。Python logging模块提供了大量的调整方法，配置也非常简单。

总的来说，logging的配置包括添加一个`Formatter`和一个`Handler`到根logger。因为这个root logger是共用的，这个logging模块提供了一个称为`basicConfig`的功能来处理主要的使用场景。

应用程序将尽可能配置logging，通常是应用程序首先要做的事情，这样应用程序启动时就不会丢失日志。

最后，应用程序将在主应用代码中包装一个`try/except`代码块，以便通过logging接口而不是标准错误`stderr`来发送异常。

# 案例1：发送日志到Systemd的标准输出

这个最简单的也可能是最好的配置项是使用systemd，应用程序最后需要发送日志消息到标准输出`stdout`或标准错误`stderr`并让systemd转发消息给journald和syslog就可以。这种情况下，甚至不需要捕捉异常，因为Python已经将异常写入到标准错误中。

```python
import logging
import os

loggging.basicConfig(level=on.environ.get("LOGLEVEL","INFO"))

exit(main())
```

以上，应用程序现在将所有消息以level INFO或以上级别发送到`stderr`，使用的是简单格式：

```
ERROR:the.module.name:The log message
```

# 案例3：发送日志到文件

将日志记录到独立的文件，可以方便日志采集系统独立对不同应用采集日志，进行集中化分析处理。

```python
import logging
import logging.handlers
import os

def main():
    handler = logging.handlers.WatchedFileHandler(
            os.environ.get("LOGFILE", "/var/log/myApp.log"))
    formatter = logging.Formatter(logging.BASIC_FORMAT)
    handler.setFormatter(formatter)
    root = logging.getLogger()
    root.setLevel(os.environ.get("LOGLEVEL", "INFO"))
    root.addHandler(handler)

    ...

    try:
        vmname = sys.argv[2]
        logging.info("vmname is %s" % vmname)
    except:
        logging.exception("Can't get vmname!")
        sys.exit(-2)

if __name__ == "__main__":
    main()
```

参考 [When to use logging](https://docs.python.org/2/howto/logging.html#when-to-use-logging) 可以看到不同级别日志方式，例如：

```
logging.warning()
logging.error()
logging.exception()
logging.critical()
```

**`注意`** (参考 [TypeError: unsupported operand type(s) for %: 'NoneType' and 'str'](https://stackoverflow.com/questions/23372824/typeerror-unsupported-operand-types-for-nonetype-and-str))

正确的格式是：

```python
logging.info("vmname is %s" % vmname)
```

不要写成

```python
logging.info("vmname is %s") % vmname
```

错误的格式会导致提示：`TypeError: unsupported operand type(s) for %: 'NoneType' and 'str'`

类似 `print("I said: %r" % x)`

# 参考

* [Python Logging Basics](https://www.loggly.com/ultimate-guide/python-logging-basics/) - 本文译自这篇指南，加上自己的一些实践