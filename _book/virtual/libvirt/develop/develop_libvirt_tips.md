# 函数前需要规范注释

在增加的函数前必须有完整规范的注释，否则会导致编译报错。

# 新增函数

在 `libvirt.c` 新增函数需要在 `include/libvirt/libvirt.h.in` 和 `src/libvirt_public.syms` 中添加定义，否则编译会报错 `undefined reference to 'function_xxxx'`

`include/libvirt/libvirt.h.in`:

```
int function_xxxx(const char *abc, const char *xyz);
```

`src/libvirt_public.syms`:

```
LIBVIRT_0.0.3 {
    global:
    ...
        function_xxxx;
```