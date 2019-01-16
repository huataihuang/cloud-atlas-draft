# 服务器端框架

> 补充：
> 参考[Swift 语言正式开始布局 Server-Side 战略](https://zhuanlan.zhihu.com/p/23217020) 可以看到Swift正在逐步加强Server开发的标准库支持，以便能够统一不同框架的各自实现。[Swift Server Work Group](https://swift.org/server/)预计[SwiftNIO](https://github.com/apple/swift-nio) 从 Swift 4 开始稳定，主要基于[IBM Kitura](https://www.kitura.io/)和[Vapor](https://vapor.codes/)社区的框架。
>
> 目前，Swift的服务端优势可能还不如Go

在Linux平台也有很多服务端Swift框架：

* [Vapor](https://github.com/vapor/vapor) - 推荐的服务端Swift web框架
* [Kitura](https://github.com/IBM-Swift/Kitura) - 由IBM开发的Swift web框架和HTTP服务器
* [Noze.io](https://github.com/NozeIO/Noze.io) Swift的事件驱动I/O流
* [Perfect](https://github.com/PerfectlySoft/Perfect) - 服务端Swift，核心toolset和框架
* [Zewo](http://www.zewo.io/)

# Loggers

* [CleanroomLogger](https://github.com/emaloney/CleanroomLogger) - 可扩展的基于Swift的Logging API
* [HeliumLogger](https://github.com/IBM-Swift/HeliumLogger)
* [Rainbow](https://github.com/onevcat/Rainbow)
* [SwiftyBeaver](https://github.com/SwiftyBeaver/SwiftyBeaver)

# Databases

* [mysql-swift](https://github.com/novi/mysql-swift)
* [MongoKitten](https://github.com/OpenKitten/MongoKitten)


...

# 参考

* [Swift packages for linux](https://theswiftdev.com/2018/09/18/swift-packages-for-linux/) 汇总了大量用于Linux操作系统的Swift软件包，请参考原文获得最新的信息
* [Web Development with Swift](https://theswiftwebdeveloper.com/web-development-in-swift-3f5061b29f8d)