Slab allaction是针对内核对象的高效内存分配管理机制。Slab分配减少了内存分配和回收导致的碎片化。Slab技术被用于保留包含了一个确定类型用于相同类型随后分配的重用数据对象所包含的分配内存。slab类似一个对象池，但是只用于内存而不是其他资源。slab内存分配技术最早是Solaris 5.4引入，现在已经广泛用于Unix以及Unix-like操作系统，包括FreeBSD和Linux。

# Slab基础

slab技术引入的主要动机是初始化和销毁内核数据对象实际成本超过了分配给对象的内存。通过内核广泛使用的对象创建和删除，初始化的开销会导致明显的性能下降。因此对象缓存概念被引入以避免对象状态初始化所使用的功能开销。

使用slab内存分配技术，符合数据对象类型或大小的内存块被预先分配(allocated slot)。slab分配器跟踪这些内存块，也称为缓存（cache），所以当接收到这种类型的数据对象的内存分配请求，内核可以立即使用已经分配的内存slot来满足请求。销毁对象不会释放内存，但是slab分配器会标记这个slot作为open状态。如果下次调用相同大小的内存就返回这个没有使用的内存slot。这个过程消除了需要搜索符合的内存空间以及极大地减轻了内存碎片。这种情况下，一个slab就是一个或多个连续的内存页包含了预先分配的内存块。

# slab实现

要理解slab分配算法需要定义和解释以下概念：

* Cache: 缓存代表一个少量分配的非常快速的内存。一个cache是特定类型对象的存储，例如信号，进程描述符，文件对象等等
* Slab: slab表示连续的内存，通常是物理连续的内存页。一个cache缓存可以存储在一个或多个slab中。这个slab就是实际包含cache的特定类型对象的数据的容器。

当一个程序设置一个缓存，它将分配一系列对象给带有缓存的slab，这个对象数量取决于分配的slab的大小。

slab可能存在以下状态：

* 空白 - 一个slab中所有对象都是free的
* 部分使用 - slab中包含使用的和没有使用的对象
* 完全使用 - slab中的所有对象都被使用了

初始的时候，系统标记所有的slab都是"空白"的，当进程调用一个新的内核对象，系统就会尝试为这个对象在包含了这个类型的缓存的slab中找到一个空闲位置。如果没有这样的空闲位置，系统就会从连续的物理内存页中分配一个新的slab并给这个slab设置一个cache。这个新的对象就从这个slab获得，并且这个位置被标记为"部分使用"。

这个分配的任务非常快速，因为系统实际是从slab中创建对象。

`Large slabs`: 大slab是缓存的对象至少是主机内存页大小的1/8。large slab具有和small slab不同的设计的原因是允许large slab更好地包装到页面大小的单元，以减少内存碎片。这种large slab包含一系列bufctls，即每个分配的buffer（buffer就是slab分配器将要使用的内存）的简单的控制器。

`small slabs`: 小slab是包含对象小于主机内存页的1/8。这些small slab需要从逻辑层进一步优化，通过使用bufctls(也就是和数据大小相同并导致内存被更多使用)。一个small slabe实际上就是一个内存页，并且具有一个定义的结构以避免bufctls。内存页的后面部分包含了`slab header`，也就是包含slab需要的信息。在这个内存页的起始地址，有很多buffer可以用于分配无需运行到内存页的slab header。

# slab详解

# 参考

* [Slab allocation](https://en.wikipedia.org/wiki/Slab_allocation)
* [Overview of Linux Memory Management Concepts: Slabs](http://www.secretmango.com/jimb/Whitepapers/slabs/slab.html)