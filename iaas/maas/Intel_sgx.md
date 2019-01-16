> 本文是从[IBM Cloud bare metal servers](https://console.bluemix.net/docs/bare-metal/about.html#about) 采用了Intel SGX技术来隔离物理服务器资源的线索开始，整理汇总网上一些相关资料，作为学习和了解安全隔离技术的文档摘抄。

Intel SGX（Software Guard Extensions）使得开发者可以将自己的应用程序分区到基于处理器的区域或者内存执行的保护区域。采用这种新型的应用层信任执行环境，开发者可以激活标识和记录隐私，安全浏览，以及数字版权管理，实现高安全要求的数据存储：

* 机密和完整性：增强操作系统，BIOS,VMM,SMM或TEE层
* 低学习曲线：熟悉的操作系统程序模型集成在父级应用程序和在主处理器中执行
* 远程证明和提供：提供远程验证一个应用程序区域表示和安全密钥，证书以及其他区域敏感数据
* 较小的被攻击面：处理器边界限制 - 数据，内存、I/O加密

> Intel SGX SDK针对Windows平台开发

# SGX技术定义

SGX全称Intel Software Guard Extensions，是对因特尔体系（IA）的一个扩展，用于增强软件的安全性。

SGX并不是识别和隔离平台上的所有恶意软件，而是将合法软件的安全操作封装在一个enclave中，保护其不受恶意软件的攻击，特权或者非特权的软件都无法访问enclave，也就是说，一旦软件和数据位于enclave中，即便操作系统或者和VMM（Hypervisor）也无法影响enclave里面的代码和数据。

Enclave的安全边界只包含CPU和它自身。SGX创建的enclave也可以理解为一个可信执行环境TEE（Trusted Execution Environment）。SGX中一个CPU可以运行多个安全enclaves，并发执行亦可。

借助Intel处理器的SGX技术，通过CPU的硬件模式切换，系统进入可信模式执行，只使用必需的硬件构成一个完全隔离的特权模式，加载一个极小的微内核操作系统支持任务调度，完成身份认证。

通过使用Intel SGX技术，构建Enclave作为完全隔离的特权模式的具体实现方案如下：

* 将需要运行的虚拟机镜像加载到磁盘中。
* 生成加密应用程序代码和数据的秘钥凭证，SGX技术提供了一种较为先进的秘钥加密方法，其秘钥由SGX版本秘钥、CPU机器秘钥和Intel官方分配给用户的秘钥在秘钥生成算法下生成的全新秘钥，使用此秘钥对需要加载的应用程序的代码和数据进行加密。
* 将需要加载的应用程序或镜像的代码和数据首先加载到SGX Loader加载器中，为将其加载至Enclave做准备。
* 在Intel SGX 可信模式下动态申请构建一个Enclave。
* 将需要加载的程序和数据以EPC(Enclave Page Cache)的形式首先通过秘钥凭证解密。
* 通过SGX指令证明解密后的程序和数据可信，并将其加载进Enclave中，然后对加载进Enclave中的每个EPC内容进行复制。
* 由于使用了硬件隔离，进一步保障Enclave的机密性和完整性，保障了不同的Enclave之间不会发生冲突更不会允许其互相访问。
* 启动Enclave初始化程序，禁止继续加载和验证EPC，生成Enclave身份凭证，并对此凭证进行加密，并作为Enclave标示存入Enclave的TCS（Thread Control Structure）中，用以恢复和验证其身份。
* SGX的隔离完成，通过硬件隔离的Enclave中的镜像程序开始执行，构建基于SGX技术的硬件隔离完成。

Intel SGX最关键的优势在于将程序以外的software stack如OS和BIOS都排除在了TCB（Trusted Computing Base）以外。换句话说，就是在enclave里的code只信任自己和intel的CPU。

SGX的缺点也是比较明显:

* 需要开发人员对代码进行重构，将程序分成可信部分和非可信部分，目前有Intel发布的SDK来协助做这方面工作，但仍然是很大量的工作，而且是比较容易造成秘密泄漏的。
* 性能问题，其中enclave的进出是瓶颈，这是由于TLB中cache了enclave中的memory access的缘故，因而进出enclave需要进行TLB flush。另外执行enclave code时，非TLB的memory access也会造成额外的一些检查，导致更大的overhead。
* 如果enclave code本身有vulnerabilities的话，enclave是无法保护程序的integrity，目前就有针对bufferoverflow的ROP攻击能够控制enclave。另外也有些side-channel attack，能够导致secret leakage。

> SGX技术重要应用就是在数据中心和云端的应用
>
> Intel的SGX技术对应的ARM系统Trustzone

# 参考

* [英特尔® Software Guard Extensions 教程系列](https://software.intel.com/zh-cn/articles/introducing-the-intel-software-guard-extensions-tutorial-series) - 完整的案例教程
* [Enable New Security Models and Innovation](https://software.intel.com/en-us/sgx)
* [Intel SGX 技术初探](https://blog.csdn.net/u010071291/article/details/52750372)
* [如何评价Intel的SGX技术？](https://www.zhihu.com/question/31565742)
* [英特尔® Software Guard Extensions 教程系列：第一部分，英特尔® SGX 基础](https://software.intel.com/zh-cn/articles/intel-software-guard-extensions-tutorial-part-1-foundation)