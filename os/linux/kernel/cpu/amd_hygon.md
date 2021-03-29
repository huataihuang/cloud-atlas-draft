2020年国产化处理器受到了广泛的关注(中美贸易战)，中科海光(Hygon)是国内维二具备生产X86处理器的中国公司，其产品具有一定代表性：

- 2016年中科海光(国天津海光先进技术投资有限公司（THATIC）)向AMD购买了x86 和 SoC IP 技术授权

> 美国政府为英特尔、AMD 等公司生产的处理器进行了价值标定，一旦其算力（FLOPS）和功耗的比值过高就会被认为是「性能过强」而被限制出口。
>
> 2015 年，AMD 就已向美国国防部、商务部等机构进行了申请，并获得了向中国提供技术转让的许可。
>
> 2019 年，美国商务部将海光加入了实体清单，这意味着 AMD 难以继续向合资企业授予任何其他 IP 许可。

目前海光能够使用的是2016年已经获得的原始IP（AMD 14nm Zen架构），而不是完整的技术转让（加密技术相关技术被阉割，浮点性能削弱），底层设计和技术、专利依然属于AMD，海光只能在高级层面根据自己的需要进行修改、定制。

# Hygon服务器CPU

Hygon服务器CPU是32核处理器，现代处理器都支持超线程，通过超线程技术(x2)，相当于 64 HT 处理器。在服务器上采用双处理器SMP系统，则可以在服务器上通过 `cat /proc/cpuinfo` 看到 128 HT (32x2x2)。

- CPU缓存
  - L1缓存
    - 64KB四路 L1指令缓存
    - 32KB八路 L1数据缓存
  - L2缓存
    - 512KB八路 L2缓存
  - L3缓存
    - 8MB十六路 L3缓存

- 加密
  - 海光CPU **被去除** 了 AMD原始的Zen一代处理器使用AMD虚拟化功能(SEV)的安全加密：RSA, ECDSA, ECDH, SHA 和 AES
  - 海光Dhyana处理器SEV被改成使用 SM2, SM3 和 SM4 算法(国密算法)

> * SM2是椭圆曲线公钥密码算法，相比于RSA更先进、更节能、更安全，国家密码管理局2010年12月17日发布。
> * SM3是哈希算法，属于密码散列函数标准，用于数字签名及验证、消息认证码生成及验证、随机数生成等，原理、安全性和效率都类似SHA-256，国家密码管理局2010年12月17日发布。
> * SM4是分组密码算法，用于数据加密，分组和秘钥长度都是128位，类似AES-128，国家密码管理局2012年3月21日发布。

- 海光获得架构的整数性能基本没变，但是浮点性能损失很大:
  - DIV、SQRT等浮点指令直接消失
  - 大量的MMX/SSE简单指令则被降速

## 随机数生成器

早期海光CPU版本 `/dev/urandom` 性能较低，原因是RDSEED（用于生成随机数算法的种子生成）真随机数发生器产生种子速度不够强或质量还不足，小概率被撞上了产生了延迟。后期二代产品真随机数发生器由1个增加到3个，同时被撞上的概率接近0，就不存在这样的问题了。

> 参见 [中科海光CPU的首次评测：基于AMD架构，覆盖桌面服务器端](https://www.jiqizhixin.com/articles/2020-03-04-4) 提到了Hygon Dhyana（桌面版本） `RDSEED` 比 Hygon Dhyna Plus（服务器版本)要慢10倍。
>
> 不过海光RDRAND算法比原先AMD Zen版本快

测试服务器 `/dev/urandam` 设备性能:

```
head -c 1M /dev/urandom > /tmp/out
```

如果出现比较明显的延迟，则可能和上述 `RDSEED` 性能相关，有一定概率会导致操作系统加密相关应用异常(例如`sshd`服务)。可以考虑在BIOS设置 `CBS-Moksha Common Options` > `RDSEED and RDRAND Control` 配置成 `disable` (默认是 `auto`) ，这样操作系统会调用软随机数发生器来规避这个问题。

## 功能缺失

据 [中科海光CPU的首次评测：基于AMD架构，覆盖桌面服务器端](https://www.jiqizhixin.com/articles/2020-03-04-4) 说明，虽然海光CPU标记了 AVX 和 AVX2 功能，但实际被禁用，导致相关测试无法通过。此外 AESNI、SHA、CLMUL、FMA4、BMI、BMI2等指令也无法运行。

上述指令和加密编码相关，导致海光CPU（32核心双处理器配置）的AES编码甚至不如入门级4核心锐龙3 1200

# 性能结论

* 海光CPU在AMD Zen 1基础上做了大量修改，例如加密功能做了替换。但是整体性能比同代原版CPU略差：
  * 整数性能基本相同，浮点性能显著下降(普通指令吞吐量只有原先1/2)
  * 随机数生成机制已经修改，加密引擎被替换
  * 不能对常见对AES指令加速(不支持AVX和AVX2功能)，但是增加了国蜜要求指令 SM2, SM3 和SM$

* 海光CPU基于AMD Zen1定制，由于合作协议只限于Zen 1而不是大获成功的Zen 2，所以技术上有诸多不足：例如Zen 2支持L3缓存PQoS(对标Intel RDT技术)就无法获得，这在数据中性混布计算中有非常大的局限性

* 根据 [Winichip资料： Zen - Microarchitectures - AMD](https://en.wikichip.org/wiki/amd/microarchitectures/zen) ：
  * Linux从 Kernel 4.10才开始支持Zen架构，所以要能够正常工作，一定要选择 Kernel 4.10 以后版本，建议参考主流发行版本 CentOS 8以及 Ubuntu 20.04 LTS内核版本

# 参考

* [中科海光CPU的首次评测：基于AMD架构，覆盖桌面服务器端](https://www.jiqizhixin.com/articles/2020-03-04-4)
* [Zen架构！国产海光x86 CPU实测：虽有缩水 意义非凡](https://tech.sina.cn/digi/nb/2020-03-02/detail-iimxxstf5057857.d.html)
* [中国两大X86 CPU：海光和兆芯](http://www.brofive.org/?p=3686) - 有关国产化X86服务器的背景信息(海光和AMD合作)
* [Winichip资料： Zen - Microarchitectures - AMD](https://en.wikichip.org/wiki/amd/microarchitectures/zen) - 如果要详细研究Zen架构，这个技术文档是很好的起点，汇总了大量架构信息