# CPU flags

`cat /proc/cpuinfo` 可以查看CPU flags ，常用的`flag`如下：

* `lm` - 表示`64位`处理器
* `vmx`(Intel) / `svm`(AMD) - 硬件虚拟话
* `aes` - `AES`（[AES instruction set](https://en.wikipedia.org/wiki/AES_instruction_set)）: Advanced Encryption Stand Instruction Set，也就是Intel的Advanced Encryption Standard New Instructions,AES-NI是支持AES加密和解密的硬件支持
* `smx` - `Safer Mode Extensions`也称为`Intel TXT`（Intel Trusted Execution Technolgy，或者 LaGrande Technology）
* `hypervisor` - 表示主机运行在`hypervisor`之上，也就是本机是虚拟机

详细的cpu flag可以参考内核源代码 `arch/x86/include/asm/cpufeature.h`

> `util-linux-ng`软件包中有一个工具[lscpu](http://www.cyberciti.biz/faq/lscpu-command-find-out-cpu-architecture-information/)可以查询cpu的信息，对于 `XEN`和`KVM`的虚拟机，分别可以显示如下，可以用来判断虚拟机的类型

```
...
Hypervisor vendor:     Xen
Virtualization type:   full
...
```

```
...
Hypervisor vendor:     KVM
Virtualization type:   full
...
```

> 如果服务器是硬件（非虚拟化），则显示如下表示是`host`主机

```
Virtualization:        VT-x
```

# 参考

* [What do the flags in /proc/cpuinfo mean?](http://unix.stackexchange.com/questions/43539/what-do-the-flags-in-proc-cpuinfo-mean)