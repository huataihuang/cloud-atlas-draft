Node.js采用C++语言编写而成，是一个JavaScript的运行环境。Node.js采用了Google Chrome浏览器的V8引擎，性能很好，同时还提供了很多系统级的API，如文件操作、网络编程等。浏览器端的Javascript代码在运行时会受到各种安全性的限制，对客户系统的操作有限。相比之下，Node.js则是一个全面的后台运行时，为Javascript提供了其他语言能够实现的许多功能。

* 采用了Google Chrome浏览器的V8引擎，同时还提供了很多系统级的API，如文件操作、网络编程等
* 采用事件驱动、非阻塞I/O模型
* 为了方便服务器开发，Node.js的网络模块特别多，包括HTTP、DNS、NET、UDP、HTTPS、TLS等，开发人员可以在此基础上快速构建Web服务器

在服务器端，Node使用了Chrome的v8虚拟机，由于执行的是直接编译成本地机器码，性能非常卓越。此外，Node在服务器端使用JavaScript的优点：

* 使用一种JavaScript语言就能编写整个Web应用
* 原生支持JSON这种非常流行的数据交换格式
* 在CouchDB和MongoDB的NoSQL数据库使用的就是JavaScript
* 紧跟ECMAScript标准，可以使用新的JavaScript语言特性

# Node.js特性

Node为服务端JavaScript提供了一个事件驱动的、异步的平台。

当服务器上运行的程序遇到I/O阻塞，通常采用多线程方式，即每个连接分配一个线程，并为那些连接设置一个线程池。线程通畅都处于进程之内，并且会维护自己的工作内存，每个线程会处理一到多个服务器连接。但是程序捏的线程管理会非常复杂，并且当线程处理很多并发连接时，线程会消耗额外的操作系统资源，以便能够在CPU和内存中做上下文切换。

在Node中，I/O几乎总是在主事件轮询之外进行，使得服务器可以一直处于高效并且随时能够做出响应的状态。这样进程就不会受到I/O限制，因为I/O延迟不会拖垮服务器，或者像阻塞方式下那样占用很多资源。

# 参考

* [深入浅出Node.js（一）：什么是Node.js](http://www.infoq.com/cn/articles/what-is-nodejs)

----

# Dashboard界面

搜索可以发现，很多美观的Dashboard交互界面都是采用node.js开发的，侧面证明node.js在开发web交互界面的优势。（甚至很难找到python开发的dashboard）：

* [PatternFly](https://github.com/patternfly/patternfly)
  * [Copr, Dist Git and Patternfly](https://blog.samalik.com/copr-dist-git-and-patternfly/) - Fedora项目采用 Dist Git和Patternfly开发了用于编译Fedora rpm包的平台