之前我嵌入图片都是使用 `image` 指令：

```
.. image:: ../_static/kernel/clos_cbm_example.png
```

不过，在文档中，其实会引用图片，所以改为使用 `figure` 指令，可以添加更多内容:

```
.. figure:: ../_static/kernel/config_l3_cbms_per_clos.png
   :scale: 50%

   Figure 1: 为每个服务逻辑分类 (logical class of service, CLOS) 配置L3容量位掩码 (L3 capacity bitmasks)

   通过 MSR的  ``IA32_L3_MASK_n`` 可以配置CLOS的L3容量位掩码，这里 ``n`` 表示 CLOS 编号
```

# 参考

* [Figure](http://docutils.sourceforge.net/docs/ref/rst/directives.html#figure)
* [Reference Figures in reStructuredText via Figure Numbers using :numref:](https://stackoverflow.com/questions/44247102/reference-figures-in-restructuredtext-via-figure-numbers-using-numref)