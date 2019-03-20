# Preemption Timer技术

`Preemption Timer`是一种可以周期性使VM触发`VMEXIT`的一种机制。

即设置了Preemption Timer之后，可以使得虚拟机在指定的TSC cycle之后产生一次VMEXIT并设置对应的exit_reason，trap到VMM中。该机制很少被社区的开发者使用，甚至连Linux KVM部分代码中连该部分的处理函数都没有，只是定义了相关的宏（这些宏还是在nested virtualization中使用的）。

注意：

* 在旧版本的Intel CPU中Preemption Timer是不精确的。在Intel的设计中，Preemption Timer应该是严格和TSC保持一致，但是在Haswell之前的处理器并不能严格保持一致。
* Preemption Timer只有在VCPU进入到Guest时（即进入non-root mode）才会开始工作，在VCPU进入VMM时或者VCPU被调度出CPU时，其值都不会有变化。

# 使用场景



# 参考

* [Intel VT技术中的Preemption Timer](https://blog.csdn.net/xelatex_kvm/article/details/17761415) - 本文摘自这篇blog，作为技术参考资料搜集