> 本文是在MacBook Air上运行ubuntu server 18.04.1 LTS的经验汇总

# 无线网卡

```
lshw -c network
```

可以显示服务器具有的网络接口，其中可以看到无线网卡：

```
  *-network
       description: Network controller
       product: BCM4360 802.11ac Wireless Network Adapter
       vendor: Broadcom Limited
       physical id: 0
       bus info: pci@0000:03:00.0
       version: 03
       width: 64 bits
       clock: 33MHz
       capabilities: pm msi pciexpress bus_master cap_list
       configuration: driver=bcma-pci-bridge latency=0
       resources: irq:18 memory:b0600000-b0607fff memory:b0400000-b05fffff
```



# 参考

* [Installing Ubuntu Linux 16.04 LTS on Macbook Air 7,2 (2015) and getting it to work properly](http://lesavik.net/post/getting-ubuntu-linux-to-work-on-macbook-air-7.2/)