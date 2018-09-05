在shell脚本中，需要修改某个配置文件的配置项。比较简单粗暴的方式是，先sed删除掉匹配行，然后再在配置文件末尾`echo`方式添加一行。但是这种方式会导致配置文件很混乱，并且对于一些标准的"段落块"INI配置文件会引发问题。

如果有大量的配置需要修改，并且希望标准化配置方法，可以采用[配置修改工具augeas](../utilities/augeas)。不过，对于短小简单的shell脚本，可以使用`sed`来实现配置修改。

# 使用sed设置配置文件 `key=value`

举例，需要将`/etc/libvirt/qemu.conf`默认配置

```
auto_dump_path = "/var/lib/libvirt/qemu/dump"
```

修改成自定义目录；

```
auto_dump_path = "/myapp/qemu/dump"
```

命令如下：

```bash
sed -i -e '/^auto_dump_path =/ s/= .*/= "\/myapp\/qemu\/dump"/' /etc/libvirt/qemu.conf
```

解释：

* `-i`表示sed将处理结果直接写入到输入文件，这样就不会打印输出
* `/^auto_dump_path =/` 表示匹配`//`之间的内容，这里字符串开头加了`^`是为了匹配实际生效的非注释行，就不会匹配到`#auto_dump_path =`这样的配置注释内容。`^`表示行首。
* `s/OLD/NEW/`是执行一个替换，`OLD`字符串是一个规则匹配到正则表达式，将被替换成`NEW`字符串。
* 在正则表达式中，`.*`表示"匹配任何内容"，所以这里`= .*`就会匹配上等于符号，空格以及其他任何内容。
* 在替换内容中`= "\/myapp\/qemu\/dump"`，使用`\/`的`\`符号是转义符。

# sed参数传递(参数中包含`/`)

上述一条命令修改配置文件的键值虽然方便，但是在shell脚本中，我们会使用变量，sed是如何使用shell中的变量呢？

方法很简单，就是将我们习惯使用的`''`修改成`""`，这样在shell脚本中使用sed时，会自动实现变量替换（因为在shell中，双引号中会解析变量）：

```bash
config=/etc/libvirt/qemu.conf
key=auto_dump_path
value=/myapp/qemu/dump

sed -i -e "/^$key =/ s/= .*/= $value/" $config
```

然而问题来了，由于传递的`value`中包含了`/`作为路径，对于sed来说，命令分隔符默认就是`/`，这会导致传递`value`中包含的`/`被sed解析成命令分隔符。

这个问题在[Environment variable substitution in sed](https://stackoverflow.com/questions/584894/environment-variable-substitution-in-sed)提供了解决思路：

> sed实际上可以使用其他字符来代替`/`作为分隔符，所以如果你传递的参数中包含了`/`，你可以用其他不可能包含在参数中的字符来作为sed的分隔符。例如使用`@`或者`#`。所以我们的脚本就可以修改成使用`#`作为sed分隔符：

```bash
...
sed -i -e "/^$key =/ s#= .*/# $value#" $config
```

> sed工具已经考虑过这样的特殊字符操作，不需要使用转义符就可以轻松实现行编辑。

现在我们的脚本改进如下：

```bash
function config_set_key_value() {
    local config=$1
    local key=$2
    local value=$3

    sed -i -e "/^$key =/ s#= .*#= \"$value\"#" $config

    if grep "$key = \"$value\"" $config;then
        echo "config $config set $key as $value SUCCESS" > /dev/null
    else
        echo "append set $key as $value to config $config" > /dev/null
        echo "$key = \"$value\"" >> $config
    fi
}

config_set_key_value /etc/libvirt/qemu.conf auto_dump_path /myapp/qemu/dump
```

# 配置格式适配

仔细观察Linux系统配置文件，常见有两种格式的配置赋值方式，主要区别是`=`前后是否存在空格

```bash
# shell格式，例如 /etc/sysconfig 目录下配置
GRUB_TIMEOUT=5
```

```python
# python格式，例如 /etc/libvirt 目录下配置
vnc_listen = "0.0.0.1"
```

此外，数值通常不使用引号，字符串则使用引号。

通过以下函数判断传入的参数是否是整数值来确定添加引号，以及通过分析现有配置文件格式的`=`前后是否有空格来设置格式

```bash
function config_set_key_value() {
    local config=$1
    local key=$2
    local value=$3

    # check value is number or character (number is integer)
    if [ "$value" -eq "$value" ] 2>/dev/null;then
        echo "value is number" > /dev/null
    else
        value="\"$value\""
    fi

    # check config "=" rear " ", if exist " ", same set config value as same
    value_char1=`grep -v "^#" $config | grep -v "^$" | tail -1 | awk -F= '{print $2}' | cut -c1`

    if [ "$value_char1" = " " ];then
        key="$key "
        value=" $value"
    else
        echo "no change $key and $value" > /dev/null
    fi

    sed -i -e "/^$key=/ s#=.*#=$value#" $config

    check_line=`grep ^$key $config`
    set_line="$key=$value"
    if [ "$check_line" = "$set_line" ];then
        echo "config $config set $key as $value SUCCESS" > /dev/null
    else
        echo "append set $key as $value to config $config" > /dev/null
        echo "$key=$value" >> $config
    fi
}

config_set_key_value /etc/sysconfig/grub GRUB_TIMEOUT 10
config_set_key_value /etc/libvirt/qemu.conf auto_dump_path /myapp/qemu/dump
```

# 参考

* [How do I use sed to change my configuration files, with flexible keys and values?](https://stackoverflow.com/questions/5955548/how-do-i-use-sed-to-change-my-configuration-files-with-flexible-keys-and-values)
* [Environment variable substitution in sed](https://stackoverflow.com/questions/584894/environment-variable-substitution-in-sed)