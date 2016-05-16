Ansible可以同时处理多个系统，其使用的方法是通过清单文件的系统列表。这个清单文件默认位于`/etc/ansible/hosts`。并且，也可以同时使用多个清单文件，甚至可以动态地或者从云资源中拉取清单（参考[动态清单](dynamic_inventory.md)）。

# 主机和分组

`/etc/ansible/hosts`是一个类似INI格式的文件

```bash
mail.example.com

[webservers]
foo.example.com
bar.example.com

[dbservers]
one.example.com
two.example.com
three.example.com
```

上述配置中分组按照服务器类型，例如web服务器和数据库服务器。

如果主机使用了非标准的SSH端口，可以在主机名后加上端口号，类似

```bash
badwolf.example.com:5309
```

也支持以下方式表示主机

```bash
[webservers]
www[01:50].example.com
```

```bash
[databases]
db-[a:f].example.com
```

可以设置每个主机的连接方式

```bash
[targets]

localhost              ansible_connection=local
other1.example.com     ansible_connection=ssh        ansible_user=mpdehaan
other2.example.com     ansible_connection=ssh        ansible_user=mdehaan
```

# 分组变量

可以一次给整个组设置变量

```bash
[atlanta]
host1
host2

[atlanta:vars]
ntp_server=ntp.atlanta.example.com
proxy=proxy.atlanta.example.com
```

# 子组和组变量

可以使用`:children`后缀来建立组的子组：

```bash
[atlanta]
host1
host2

[raleigh]
host2
host3

[southeast:children]
atlanta
raleigh

[southeast:vars]
some_server=foo.southeast.example.com
halon_system_timeout=30
self_destruct_countdown=60
escape_pods=2

[usa:children]
southeast
northeast
southwest
northwest
```

# 案例

> 待补充