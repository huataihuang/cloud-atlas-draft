通过systemd管理的每个持久化单元都有一个配置文件位于`/usr/lib/systemd/system/`目录。要修改一个服务单元的参数，就要修改这样的配置文件。这个配置修改可以手工操作，或者通过`systemctl set-property`命令接口来完成。

# 使用命令行接口设置参数

`systemctl set-property`命令可以在应用程序**运行的时候**持久化修改资源控制设置，语法如下：

```
systemctl set-property name parameter=value
```

上述命令中`name`替换成你希望修改的systemd单元，`parameter`是需要修改的参数的名字，而`value`则是设置参数的新值。

注意：不是所有的单元参数都能过在运行是修改，不过大多数资源控制相关的参数可以在线修改，参考下文`修改单元文件`部分的完整列表。注意，`systemctl set-property`允许一次修改多个属性，比单独修改要方便。

这个修改是立即生效的，并且写入到单元文件，所以系统重启也是生效的。可以通过添加`--runtime`选项来使设置临时生效

```
systemctl set-property --runtim name property=value
```

举例，限制`httpd.service`的CPU和memory使用：

```
systemctl set-property httpd.service CPUShares=600 MemoryLimit=500M
```

如果是临时生效设置

```
systemctl set-property --runtime httpd.service CPUShares=600 MemoryLimit=500M
```


# 参考

* [2.3. MODIFYING CONTROL GROUPS](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Resource_Management_Guide/sec-Modifying_Control_Groups.html)