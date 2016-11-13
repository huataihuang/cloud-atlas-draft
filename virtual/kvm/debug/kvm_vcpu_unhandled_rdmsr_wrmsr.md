今天线上一个kvm虚拟化集群大量在控制台打印日志。由于串口控制台输出大量日志信息会引发服务器性能问题，导致响应缓慢，严重时会导致服务器没有响应，严重影响（用户虚拟机）服务运行。

```
[4914747.818166] kvm [10642]: vcpu6 unhandled rdmsr: 0x19c
[4914747.818172] kvm [10642]: vcpu6 unhandled rdmsr: 0x19c
[4914747.818178] kvm [10642]: vcpu6 unhandled rdmsr: 0x19c
[4914747.818183] kvm [10642]: vcpu6 unhandled rdmsr: 0x19c
[4914747.818189] kvm [10642]: vcpu6 unhandled rdmsr: 0x19c
[4914747.818220] kvm [10642]: vcpu7 unhandled rdmsr: 0x1a2
[4914747.818231] kvm [10642]: vcpu7 unhandled rdmsr: 0x19c
[4914747.818238] kvm [10642]: vcpu7 unhandled rdmsr: 0x19c
[4914747.818244] kvm [10642]: vcpu7 unhandled rdmsr: 0x19c
```

上述报错信息不实kvm虚拟化的bug，是因为qemu不支持某些内核特性，虚拟机CPU使用宿主模式时，会报 `vcpu unhandled` 的错误提示。

kvm虚拟机的cpu设定为以下两种模式，宿主系统的内核会默认开启追踪。

```
cpu mode='host-passthrough'
```

```
cpu mode='host-model'
```

如果某些功能`qemu`不支持就会抛出以上报错

上述报错信息并不影响使用，若要关闭此提示：

```
echo 1 > /sys/module/kvm/parameters/ignore_msrs
```

# 参考

* [kvm vcpu unhandled rdmsr/wrmsr](https://my.oschina.net/anglix/blog/504822)