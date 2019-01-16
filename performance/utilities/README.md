# 使用工具推荐

[How to Run Industry-Standard Benchmarks on the Cyclone V SoC and Arria V SoC FPGAs](https://rocketboards.org/foswiki/pub/Documentation/LinuxBenchmarking/How_to_Run_CV_SoC_benchmarks_051316.pdf) 提供了工业标准性能测试工具的编译安装，可以作为参考：

* 处理器核心性能压测

| Benchmark工具 | 说明 | 可以用于检测的硬件 |
| ---- | ---- | ---- |
| CoreMark | 处理器核心，缓存内存读写 | CPU Pipeline, L1缓存 |
| Dhrystone | 整数和分支操作 | CPU Pipeline, 整数逻辑计算单元（Integer ALU），L1缓存 |
| Whetstone | 浮点数操作 | CPU Pipeline, ENON/浮点计算单元（FPU），L1缓存 |

* 内存密集测试

| Benchmark工具 | 说明 |
| ---- | ---- |
| STREAM | 大量的顺序数据流的内存读写 |
| LMBench | 随机内存读写 |

使用不同的工具链可能会得到不同的benchmark测试结果，并且测试工具受到编译参数的影响，例如编译优化界别，单核或多核，是否使用neon，以及是否使用浮点计算硬件等。