Node.js采用C++语言编写而成，是一个JavaScript的运行环境。Node.js采用了Google Chrome浏览器的V8引擎，性能很好，同时还提供了很多系统级的API，如文件操作、网络编程等。浏览器端的Javascript代码在运行时会受到各种安全性的限制，对客户系统的操作有限。相比之下，Node.js则是一个全面的后台运行时，为Javascript提供了其他语言能够实现的许多功能。

* 采用了Google Chrome浏览器的V8引擎，同时还提供了很多系统级的API，如文件操作、网络编程等
* 采用事件驱动、非阻塞I/O模型
* 为了方便服务器开发，Node.js的网络模块特别多，包括HTTP、DNS、NET、UDP、HTTPS、TLS等，开发人员可以在此基础上快速构建Web服务器

在服务器端，Node使用了Chrome的v8虚拟机，由于执行的是直接编译成本地机器码，性能非常卓越。此外，Node在服务器端使用JavaScript的优点：

* 使用一种JavaScript语言就能编写整个Web应用
* 原生支持JSON这种非常流行的数据交换格式
* 在CouchDB和MongoDB的NoSQL数据库使用的就是JavaScript
* 紧跟ECMAScript标准，可以使用新的JavaScript语言特性

# 参考

* [深入浅出Node.js（一）：什么是Node.js](http://www.infoq.com/cn/articles/what-is-nodejs)