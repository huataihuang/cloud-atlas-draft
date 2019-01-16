# 通过

```python
import os
import sys
import fcntl
import xml.etree.ElementTree as ET

global example_xml
example_xml = '/home/example/example.xml

# 读取xml

lockf = None
if os.path.exists(example_xml):
    lockf = open(example_xml)
    fcntl.flock(lockf, fcntl.LOCK_EX)
    tree = ET.parse(example_xml)
    root = tree.getroot()
    logging.info("%s open and root" % example_xml)
else:
    logging.error("%s not found!" % example_xml)
    sys.exit(-1)

# 解析 name 和 memory
try:
    example_name = root.find("name").text
    logging.info("example_name is %s" % example_name)
    example['name'] = example_name
    ...
except:
    logging.exception("Can't get example_name!")
    sys.exit(-2)

# 修改添加子对象（3级） <app><color><red id='0'></red></color></app>
target = tree.find('app/color/red')
if target is None:
    print "No app/color/red tag in example.xml"
    sys.exit(-1)
target.attrib['id'] = '0'

# 完整添加子节点
e_size = "<size><high redid=\"0\" mode=\"square\" sizeset=\"%d\" /></size>" % size_set
new = ET.fromstring(e_size)
target = root.find(new.tag)
if target is not None:
    print "Tag <%s> exists in example.xml" % new.tag
    sys.exit(-3)
root.append(new)
```

----

> 以下是[用 ElementTree 在 Python 中解析 XML](https://pycoders-weekly-chinese.readthedocs.io/en/latest/issue6/processing-xml-in-python-with-element-tree.html)摘要，便于后续自己查询：使用ET处理XML确实非常方便直观，推荐使用。不过，我在实践编程时在项目上使用这些方法并没有完全实现我的目标，也许我使用方法还有问题。实际开发过程中，我使用了同事给我的参考代码进行整合，见上文。

xml.etree.ElementTree (以下简称 ET)。它提供了轻量级的 Python 式的 API ，它由一个 C 实现来提供。

ElementTree 生来就是为了处理 XML ，它在 Python 标准库中有两种实现。一种是纯 Python 实现例如 xml.etree.ElementTree ，另外一种是速度快一点的 xml.etree.cElementTree 。

```python
try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET
```

> 从 Python 3.3 开始，ElementTree 模块会自动寻找可用的 C 库来加快速度

# 将 XML 解析为树的形式

XML 是一种分级的数据形式，所以最自然的表示方法是将它表示为一棵树。ET 有两个对象来实现这个目的 － ElementTree 将整个 XML 解析为一棵树， Element 将单个结点解析为树。

XML 文件例子

```xml
<?xml version="1.0"?>
<doc>
    <branch name="testing" hash="1cdf045c">
        text,source
    </branch>
    <branch name="release01" hash="f200013e">
        <sub-branch name="subrelease01">
            xml,sgml
        </sub-branch>
    </branch>
    <branch name="invalid">
    </branch>
</doc>
```

加载并且解析这个 XML ：

```python
import xml.etree.cElementTree as ET
tree = ET.ElementTree(file='doc1.xml')
```

抓根结点元素：

```python
tree.getroot()
```

root 是一个 Element 元素

```python
root = tree.getroot()
root.tag, root.attrib
```

根元素没有任何状态，可以找到自己的子结点：

```python
for child_of_root in root:
    print child_of_root.tag, child_of_root.attrib
```

# 找到元素

Element 对象有一个 `iter` 方法可以对子结点进行深度优先遍历。 ElementTree 对象也有 `iter` 方法来提供便利。

```python
for elem in tree.iter():
    print elem.tag, elem.attrib
```

`iter` 方法接受一个标签名字，然后只遍历那些有指定标签的元素：

```python
for elem in tree.iter(tag='branch'):
    print elem.tag, elem.attrib
```

Element 有一些关于寻找的方法可以接受 [XPath](http://effbot.org/zone/element-xpath.htm) 作为参数。 find 返回第一个匹配的子元素， findall 以列表的形式返回所有匹配的子元素， iterfind 为所有匹配项提供迭代器。这些方法在 ElementTree 里面也有。

```python
for elem in tree.iterfind('branch/sub-branch'):
    print elem.tag, elem.attrib
```

在 branch 下面找到所有标签为 sub-branch 的元素。然后给出如何找到所有的 branch 元素，用一个指定 name 的状态即可：

```python
for elem in tree.iterfind('branch[@name="release01"]'):
    print elem.tag, elem.attrib
```

# 建立 XML 文档

ET 提供了建立 XML 文档和写入文件的便捷方式。 ElementTree 对象提供了 write 方法。

```python
root = tree.getroot()
del root[2]
root[0].set('foo', 'bar')
for subelem in root:
    print subelem.tag, subelem.attrib
```

* 写回文件

```python
import sys
tree.write(sys.stdout)
```

* 建立一个全新的元素，ET 模块提供了 SubElement 函数来简化过程：

```python
a = ET.Element('elem')
c = ET.SubElement(a, 'child1')
c.text = "some text"
d = ET.SubElement(a, 'child2')
b = ET.Element('elem_b')
root = ET.Element('root')
root.extend((a, b))
tree = ET.ElementTree(root)
tree.write(sys.stdout)
```

# 使用 iterparse 来处理 XML 流

XML 文档通常比较大, ET 提供一个特殊的工具，用来处理大型文档，并且解决了内存问题，这个工具叫 iterparse 。

案例XML文件如下：

```xml
<?xml version="1.0" standalone="yes"?>
<site>
    <regions>
        <africa>
            <item id="item0">
                <location>United States</location>    <!-- Counting locations -->
                <quantity>1</quantity>
                <name>duteous nine eighteen </name>
                <payment>Creditcard</payment>
                <description>
                    <parlist>
[...]
```

用一个简单的脚本来计数有多少 location 元素并且文本内容为“Zimbabwe”。这是用 ET.parse 的一个标准的写法：

```python
tree = ET.parse(sys.argv[2])

count = 0
for elem in tree.iter(tag='location'):
    if elem.text == 'Zimbabwe':
        count += 1
print count
```

所有 XML 树中的元素都会被检验。当处理一个大约 100MB 的 XML 文件时，占用的内存大约是 560MB ，耗时 2.9 秒。

但是，并不需要在内存中加载整颗树。它检测我们需要的带特定值的 location 元素。其他元素被丢弃。这是 iterparse 的来源：

```python
count = 0
for event, elem in ET.iterparse(sys.argv[2]):
    if event == 'end':
        if elem.tag == 'location' and elem.text == 'Zimbabwe':
            count += 1
    elem.clear() # discard the element

print count
```

这个循环遍历 iterparse 事件，检测“闭合的”(end)事件并且寻找 location 标签和指定的值。在这里 elem.clear() 是关键 － iterparse 仍然建立一棵树，只不过不需要全部加载进内存，这样做可以有效的利用内存空间。

处理同样的文件，这个脚本占用内存只需要仅仅的 7MB ，耗时 2.5 秒。速度的提升归功于生成树的时候只遍历一次。相比较来说， parse 方法首先建立了整个树，然后再次遍历来寻找我们需要的元素(所以慢了一点)。

# 参考

* [用 ElementTree 在 Python 中解析 XML](https://pycoders-weekly-chinese.readthedocs.io/en/latest/issue6/processing-xml-in-python-with-element-tree.html)