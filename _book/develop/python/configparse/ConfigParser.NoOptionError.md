编写了一个简单的ConfigParser脚本

```
filePath=cgroup_schema.ini
config = ConfigParser.RawConfigParser()
config.read(filePath)

section = "section1"
key = "agent:cpuset.cpus"
param = self.config.get(str(section), str(key))

print param
```

结果提示报错

```
  File "/System/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/ConfigParser.py", line 340, in get
    raise NoOptionError(option, section)
ConfigParser.NoOptionError: No option 'pangu:cpuset.cpus' in section: 'section1'
```

# `:`符号

这个报错实际上是因为`key`变量名设置不规范导致的，因为最初我设置key的时候使用了符号`:`

```
[section1]
agent:cpuset.cpus = "1"
agent:cpuset.mems = "0"
agent:memory.limit_in_bytes = "1024M"
```

> Characters `?{}|&~![()^"` must not be used anywhere in the key and have a special meaning in the value. - [parse_ini_file](http://php.net/parse_ini_file)


在`INI`格式中，`:`实际上是和`=`一样的

举例

```
[sectionSeparators]
passwd : abc=def
a:b = "value"
```

这里`sectionSeparators`配置由于同时采用了2个分隔字符`:`和`=`，此时判断：

* 默认是第一隔离字符`:`生效，所以就会把 `abc=def` 作为键值
* 但是如果使用了`""`就可以改变上述默认规则：即如果有`""`，就会把最靠近`""`的分隔字符生效，所以上述案例中`a:b = "value"`行配置就会把`=`作为隔离字符，此时`a:b`就是key。

> 参考[Class INIConfiguration](https://commons.apache.org/proper/commons-configuration/apidocs/org/apache/commons/configuration2/INIConfiguration.html)

> 不过，Python的ConfigParser似乎没有支持上述规则，使用`:`会使得提取key value失效。

准备使用`,`作为分隔符号

# 注释

在INI文件中，注释可以使用符号 `#` 和 `;`

# 层次结构

> 参考 [INI file - Hierarchy](https://en.wikipedia.org/wiki/INI_file#Hierarchy)

Hierarchy
Most commonly, INI files have no hierarchy of sections within sections. Some files appear to have a hierarchical naming convention, however. For section A, subsection B, sub-subsection C, property P and value V, they may accept entries such as [A.B.C] and P=V (Windows' xstart.ini), [A\B\C] and P=V (the IBM Windows driver file devlist.ini), or [A] and B,C,P = V (Microsoft Visual Studio file AEMANAGR.INI).

但是，ConfigParser不支持subsection，也就是不能够实现层次结构。如果要多层section，可以使用[ConfigObj](http://www.voidspace.org.uk/python/configobj.html)

并且ConfigParser一定要求有section，如果没有section的简单格式，需要使用`SimpleConfigParser`。

> 参考 [How to parse configuration files in Python](https://www.decalage.info/python/configparser)

# ConfigParser支持继承

ConfigParser支持多个配置文件，并且后读取的配置文件相同的Section会覆盖前面读取的配置文件。这样就方便先加载一个default配置，然后再加载特定定制的配置。

举例

`default.ini`如下

```
[database]
server = 127.0.0.1
port = 1234
...
```

`environment.ini`如下

```
[database]
server = 192.168.0.12
port = 2345
...
```

则可以使用

```
import os
from ConfigParser import ConfigParser
dbconf = ConfigParser()
dbconf.readfp(open('default.ini'))
if os.path.exists('environment.ini'):
    dbconf.readfp(open('environment.ini'))
dbconf.get('database', 'server') # Returns 192.168.0.12
```

# ConfigParser的Section读入字典

参考 [Python config parser to get all the values from a section?](http://stackoverflow.com/questions/8578430/python-config-parser-to-get-all-the-values-from-a-section)

```
    config = ConfigParser.RawConfigParser()
    config.read('config.ini')
    conf_section = dict(config.items('section1'))
```

# 参考

* [Class INIConfiguration](https://commons.apache.org/proper/commons-configuration/apidocs/org/apache/commons/configuration2/INIConfiguration.html)
* [INI file](https://en.wikipedia.org/wiki/INI_file)