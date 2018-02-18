最新的Ubuntu提供了[Ubuntu Core](https://developer.ubuntu.com/core/get-started)版本，支持在不同的芯片系统，SOC或虚拟机中运行，其中就包括了树莓派Raspberry Pi和[树莓派计算模块](https://www.raspberrypi.org/products/compute-module-3/)。

树莓派计算模块是一个专注于构建工业应用的计算模块，通过DDR2-SODIMM-machanically-compatible System on Modules(SoMs)来提供处理器，内存，eMMC Falsh以及电源电路。这样工程师可以在自己的定制系统中堆叠树莓派硬件和软件以实现复杂的工业级系统。

> 这种DDR2-SODIMM主机兼容的SoM系统应该是工业级设计的思路，或许可以实现在一块主板上通过这种DDR2-SODIMM接口来实现一个ARM集群，利用高速DDR通道实现。

从[compute modue datasheet](https://www.raspberrypi.org/documentation/hardware/computemodule/RPI-CM-DATASHEET-V1_0.pdf)可以了解到其设计。

不过，[Raspberry pi Compute module CM3 CM3LITE树莓派计算模块 核心板](https://item.taobao.com/item.htm?spm=a1z10.5-c-s.w4002-16425962538.25.2c5f4750kFQWZr&id=43632235352&src=raspberrypi)价格较普通的树莓派价格较为昂贵，适合设计使用。