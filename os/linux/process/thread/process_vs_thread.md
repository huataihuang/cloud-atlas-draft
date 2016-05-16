> 本文是一些技术文档的综合摘录，后续再根据自己的实践不断补充完善。

进程是程序执行时的一个实例，即它是程序已经执行到何种程度的数据结构的汇集。从内核的观点看，进程的目的就是担当分配系统资源（CPU时间、内存等）的基本单位。

线程是进程的一个执行流，是CPU调度和分派的基本单位，它是比进程更小的能独立运行的基本单位。一个进程由几个线程组成（拥有很多相对独立的执行流的用户程序共享应用程序的大部分数据结构），线程与同属一个进程的其他的线程共享进程所拥有的全部资源。

进程有独立的地址空间，一个进程崩溃后，在保护模式下不会对其它进程产生影响，而线程只是一个进程中的不同执行路径。线程有自己的堆栈和局部变量，但线程没有单独的地址空间，一个线程死掉就等于整个进程死掉，所以多进程的程序要比多线程的程序健壮，但在进程切换时，耗费资源较大，效率要差一些。但对于一些要求同时进行并且又要共享某些变量的并发操作，只能用线程，不能用进程。

进程和线程两个模型的差异在于， 进程更安全，一个进程完全不会影响另外的进程。所以这也是 unix 哲学里推荐的编程方法；但是进程间通信比线程间通信的性能差很多，尤其是，如果这个是系统的关键部分，而又有大量数据的时候，所有的进程间通信方法都比线程间的通信慢很多。

所以通常情况下推荐多进程程序，就像 `nginx`，一个 master 多个 worker，进程间只进行有限的通信（传递命令而非数据）。多线程的典型例子是 unbound，一个开源的递归 dns 服务器。它使用线程的理由也很充分：程序需要不停地向后方的授权 dns 请求数据，并传回给前方的模块。这个数据通信量大，性能要求又高，所以必须用多线程，如果是多个进程，那就要慢许多了。

# 使用线程的理由

使用多线程的理由之一是和进程相比，它是一种非常"节俭"的多任务操作方式。我们知道，在Linux系统下，启动一个新的进程必须分配给它独立的地址空间，建立众多的数据表来维护它的代码段、堆栈段和数据段，这是一种"昂贵"的多任务工作方式。而运行于一个进程中的多个线程，它们彼此之间使用相同的地址空间，共享大部分数据，启动一个线程所花费的空间远远小于启动一个进程所花费的空间，而且，线程间彼此切换所需的时间也远远小于进程间切换所需要的时间。据统计，总的说来，一个进程的开销大约是一个线程开销的30倍左右，当然，在具体的系统上，这个数据可能会有较大的区别。

使用多线程的理由之二是线程间方便的通信机制。对不同进程来说，它们具有独立的数据空间，要进行数据的传递只能通过通信的方式进行，这种方式不仅费时，而且很不方便。线程则不然，由于同一进程下的线程之间共享数据空间，所以一个线程的数据可以直接为其它线程所用，这不仅快捷，而且方便。当然，数据的共享也带来其他一些问题，有的变量不能同时被两个线程所修改，有的子程序中声明为static的数据更有可能给多线程程序带来灾难性的打击，这些正是编写多线程程序时最需要注意的地方。

除了以上所说的优点外，不和进程比较，多线程程序作为一种多任务、并发的工作方式，天然有以下的优点：

* 提高应用程序响应。这对图形界面的程序尤其有意义，当一个操作耗时很长时，整个系统都会等待这个操作，此时程序不会响应键盘、鼠标、菜单的操作，而使用多线程技术，将耗时长的操作（time consuming）置于一个新的线程，可以避免这种尴尬的情况。
* 使多CPU系统更加有效。操作系统会保证当线程数不大于CPU数目时，不同的线程运行于不同的CPU上。
* 改善程序结构。一个既长又复杂的进程可以考虑分为多个线程，成为几个独立或半独立的运行部分，这样的程序会利于理解和修改。

=============================

`从函数调用上来说，进程创建使用fork()操作；线程创建使用clone()操作。`

Richard Stevens大师这样说过：

    fork is expensive. Memory is copied from the parent to the child, all descriptors are duplicated in the child, and so on. 
	Current implementations use a technique called copy-on-write, which avoids a copy of the parent's data space to the child 
	until the child needs its own copy. But, regardless of this optimization, fork is expensive.
	
    IPC is required to pass information between the parent and child after the fork. Passing information from the parent to the 
	child before the fork is easy, since the child starts with a copy of the parent's data space and with a copy of all the 
	parent's descriptors. But, returning information from the child to the parent takes more work.
	
	Threads help with both problems. Threads are sometimes called lightweight processes since a thread is "lighter weight" 
	than a process. That is, thread creation can be 10–100 times faster than process creation.
	
	All threads within a process share the same global memory. This makes the sharing of information easy between the threads, 
	but along with this simplicity comes the problem of synchronization.

# 参考

* [Linux多线程编程（不限Linux）](http://www.cnblogs.com/skynet/archive/2010/10/30/1865267.html)
* [Linux 线程实现机制分析](https://www.ibm.com/developerworks/cn/linux/kernel/l-thread/)
* [Linux 线程模型的比较：LinuxThreads 和 NPTL](http://www.ibm.com/developerworks/cn/linux/l-threading.html)
* [知乎：Linux中进程和线程的开销基本一样啊，为什么还要多线程呢？](https://www.zhihu.com/question/19903801)