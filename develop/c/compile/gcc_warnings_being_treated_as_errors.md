有时候大型项目中，某些遗留编写不够完善，编译时候会出现以下warning。对于一些不重要的warning，可能希望直接忽略。但是，默认情况下，gcc会非常严格检查这些warning，甚至会视为error而终止编译。

例如，编译一个定制版本的libvirt，出现以下`cc1: warnings being treated as errors`错误：

```
  CC       libvirt_driver_qemu_impl_la-qemu_process.lo
cc1: warnings being treated as errors
qemu/qemu_process.c: In function 'qemuProcessStartCPUs':
qemu/qemu_process.c:2881: warning: unused variable 'cmdlist' [-Wunused-variable]
make[3]: *** [libvirt_driver_qemu_impl_la-qemu_process.lo] Error 1
make[3]: Leaving directory `/data/libvirt-kvm-build/src'
make[2]: *** [all] Error 2
make[2]: Leaving directory `/data/libvirt-kvm-build/src'
make[1]: *** [all-recursive] Error 1
make[1]: Leaving directory `/data/libvirt-kvm-build'
make: *** [all] Error 2
```

这里的报错是因为有没有使用的变量`cmdlist`，导致编译器将warning视为error，停止继续编译。

在 [How to compile without warnings being treated as errors?](https://stackoverflow.com/questions/11561261/how-to-compile-without-warnings-being-treated-as-errors) 有一个解决方法来关闭这种默认将warning作为error的行为。因为有时候并不想fix调所有warnings。

> 找到`-Werror`的设置位置，并将这个flag删除，这样warnings就只会作为warnings。
>
> 也可以将所有的warnings都这样处理，即使用参数`-Wno-error`，或者设置特定的warning不作为error：`-Wno-error=<warning name>`（这里的`<warning name>`是你不希望作为error的warning）。
>
> 如果希望将所有warning关闭，使用`-w`（但是不推荐）

例如：这里可以使用 `-Wno-error=unused-but-set-variable`

# 解决步骤

* 设置环境变量`/etc/profile`：

```
CFLAGS="-I/usr/src/kernels/linux-2.6.32-358.23.2.el5/include -Wno-error=unused-but-set-variable"
export CFLAGS
```

但是上述设置了`-Wno-error=unused-but-set-variable`或者`-Wno-error=unused-variable`都会导致

```
checking whether the C compiler works... no
configure: error: in `/home/admin/libvirt-kvm-build':
configure: error: C compiler cannot create executables
```

所以改成

```
CFLAGS="-I/usr/src/kernels/linux-2.6.32-358.23.2.el5/include -Wno-error"
export CFLAGS
```

> 感觉是gcc版本太低导致不支持`-Wno-error=unused-variable`（待验证）

# 参考

* [How to resolve “cc1: all warnings being treated as errors”](http://www.lynxbee.com/how-to-resolve-cc1-all-warnings-being-treated-as-errors/)