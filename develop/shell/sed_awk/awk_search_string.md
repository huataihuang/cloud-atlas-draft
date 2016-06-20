# 搜索匹配

通常在过滤匹配字符串的时候，我们会使用`grep`命令，而挑选打印出匹配行的某列，又会去结合`awk`，例如筛选出以下xml中的IP地址，如果采用`grep`命令过滤出ip行再传递给`awk`处理就非常raw了，特别是需要多次过滤。

```xml
<?xml version="1.0" encoding="utf-8"?>
<rsp>
  <code>200</code>
  <msg>successful</msg>
  <data>
    <ips list="true">
      <item>
        <ip>192.168.1.9</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
      <item>
        <ip>192.168.1.101</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
      <item>
        <ip>192.168.1.193</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
      <item>
        <ip>192.168.1.2</ip>
        <vlan_id>1234</vlan_id>
        <network>public</network>
      </item>
    </ips>
  </data>
</rsp>
```

`awk`其实支持几乎所有的`grep`功能，其搜索字符串非常高效，以下是处理方法：

```bash
awk -F "[<>]" '/ip/ && /[0-9]./ {print $3}' ip.xml
```

说明：

* `/XXXX/` 表示搜索`XXXX`字符串
* `&&` 符号表示同时满足两个搜索条件，即字符串中既包含"ip"又包含"数字+."；如果要表示`或`逻辑，就使用`||`
* 支持正则表达`[]`

# 输出大于某值的行

案例文件内容

```bash
Medicine,200
Grocery,500
Rent,900
Grocery,800
Medicine,600
```

输出大于`500`的行

```bash
awk -F, '$2>500' file
```

输出大于`500`且包含`Medicine`的行

```bash
awk -F, '/Medicine/ && $2>500' file
```

输出包含`Medicine`或值大于`600`的行

```bash
awk -F, '/Medicine/ || $2>600' file
```

# 参考

* [awk - Match a pattern in a file in Linux](http://www.tuicool.com/articles/F7JbEn)
* [grep vs awk : 10 examples of pattern search](http://www.theunixschool.com/2012/09/grep-vs-awk-examples-for-pattern-search.html)